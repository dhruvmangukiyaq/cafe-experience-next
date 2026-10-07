// Minimal fetch(Request) -> Express(app, req, res) bridge for Cloudflare Workers.
// Keeps the Express app, controllers and middleware completely unchanged.
import { Readable, Writable } from 'node:stream';

function headerEntries(headers) {
  const out = [];
  for (const [k, v] of headers) out.push([k.toLowerCase(), v]);
  return out;
}

// Express swaps the prototype of every request/response it touches
// (`setPrototypeOf(req, app.request)` / `setPrototypeOf(res, app.response)` in
// express/lib/middleware/init.js), which would wipe out the stream methods our
// objects rely on. Copying the whole prototype chain onto the instance as own
// properties makes that a no-op: own properties always win over the prototype.
function harden(obj) {
  const seen = new Set(Object.getOwnPropertyNames(obj));
  const seenSymbols = new Set(Object.getOwnPropertySymbols(obj));

  let proto = Object.getPrototypeOf(obj);
  while (proto && proto !== Object.prototype) {
    const keys = [
      ...Object.getOwnPropertyNames(proto),
      ...Object.getOwnPropertySymbols(proto),
    ];
    for (const key of keys) {
      if (key === 'constructor') continue;
      const isSymbol = typeof key === 'symbol';
      if (isSymbol ? seenSymbols.has(key) : seen.has(key)) continue;
      if (isSymbol) seenSymbols.add(key);
      else seen.add(key);

      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (!desc) continue;

      if (typeof desc.value === 'function') {
        Object.defineProperty(obj, key, {
          value: desc.value.bind(obj),
          writable: true,
          enumerable: false,
          configurable: true,
        });
      } else if (desc.get || desc.set) {
        // Accessors keep running with `this === obj`, so they can be copied as-is.
        Object.defineProperty(obj, key, {
          get: desc.get,
          set: desc.set,
          enumerable: false,
          configurable: true,
        });
      } else {
        // Plain data (e.g. `_eventsCount`) must stay writable, otherwise
        // assigning to it later throws once the prototype has been swapped.
        Object.defineProperty(obj, key, {
          value: desc.value,
          writable: true,
          enumerable: desc.enumerable,
          configurable: true,
        });
      }
    }
    proto = Object.getPrototypeOf(proto);
  }
  return obj;
}

function toBuffer(chunk, encoding) {
  if (Buffer.isBuffer(chunk)) return chunk;
  if (typeof chunk === 'string') return Buffer.from(chunk, encoding || 'utf8');
  if (chunk instanceof ArrayBuffer) return Buffer.from(chunk);
  if (ArrayBuffer.isView(chunk)) return Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  return Buffer.from(String(chunk));
}

class ExpressResponse extends Writable {
  constructor() {
    super();
    this.statusCode = 200;
    this.statusMessage = undefined;
    this.headersSent = false;
    this._headerList = [];
    this._chunks = [];
  }

  // on-finished / finalhandler read these
  get finished() {
    return this.writableEnded || this._done;
  }

  setHeader(name, value) {
    const key = String(name).toLowerCase();
    this._headerList = this._headerList.filter(([k]) => k !== key);
    this._headerList.push([key, value]);
    return this;
  }

  getHeader(name) {
    const key = String(name).toLowerCase();
    const hit = this._headerList.find(([k]) => k === key);
    return hit ? hit[1] : undefined;
  }

  getHeaders() {
    const out = {};
    for (const [k, v] of this._headerList) out[k] = v;
    return out;
  }

  getHeaderNames() {
    return this._headerList.map(([k]) => k);
  }

  hasHeader(name) {
    return this._headerList.some(([k]) => k === String(name).toLowerCase());
  }

  removeHeader(name) {
    const key = String(name).toLowerCase();
    this._headerList = this._headerList.filter(([k]) => k !== key);
  }

  flushHeaders() {
    this.headersSent = true;
  }

  writeHead(status, reason, headers) {
    this.statusCode = status;
    if (reason && typeof reason === 'object') headers = reason;
    if (headers) {
      for (const [k, v] of Object.entries(headers)) this.setHeader(k, v);
    }
    this.headersSent = true;
    return this;
  }

  _write(chunk, encoding, cb) {
    this._chunks.push(toBuffer(chunk, encoding));
    this.headersSent = true;
    cb();
  }

  _final(cb) {
    this._done = true;
    cb();
  }
}

/**
 * Runs an Express app against a fetch Request and resolves with a fetch Response.
 */
export function handleRequest(app, request) {
  return new Promise((resolve, reject) => {
    const url = new URL(request.url);

    const req = new Readable({ read() {} });
    req.method = request.method;
    req.url = url.pathname + url.search;
    req.headers = Object.fromEntries(headerEntries(request.headers));
    req.httpVersion = '1.1';
    req.httpVersionMajor = 1;
    req.httpVersionMinor = 1;
    req.complete = false;
    req.socket = {
      remoteAddress: request.headers.get('cf-connecting-ip') || '127.0.0.1',
      encrypted: url.protocol === 'https:',
      address: () => ({ address: '127.0.0.1', family: 'IPv4', port: 443 }),
    };
    req.connection = req.socket;
    req.setTimeout = () => req;

    if (request.body) {
      const pump = (async () => {
        const reader = request.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          req.push(Buffer.from(value));
        }
        req.complete = true;
        req.push(null);
      })();
      pump.catch((err) => req.destroy(err));
    } else {
      req.complete = true;
      queueMicrotask(() => req.push(null));
    }

    const res = new ExpressResponse();
    let settled = false;

    console.log('handleRequest: calling app', request.method, url.pathname);

    const finish = () => {
      if (settled) return;
      settled = true;
      console.log('handleRequest: finish', res.statusCode, res._chunks.length);
      try {
        const headers = new Headers();
        for (const [name, value] of res._headerList) {
          if (name === 'transfer-encoding' || name === 'connection') continue;
          const values = Array.isArray(value) ? value : [value];
          for (const v of values) headers.append(name, String(v));
        }
        const empty = res.statusCode === 204 || res.statusCode === 304;
        const body = empty ? null : Buffer.concat(res._chunks);
        resolve(new Response(body, { status: res.statusCode, headers }));
      } catch (err) {
        reject(err);
      }
    };

    res.on('finish', finish);
    res.on('close', () => {
      if (res.writableEnded) finish();
    });

    harden(req);
    harden(res);

    try {
      app(req, res);
      console.log('handleRequest: app returned sync, ended=', res.writableEnded, 'headersSent=', res.headersSent);
    } catch (err) {
      if (!settled) {
        settled = true;
        reject(err);
      }
    }
  });
}

// Worker-safe stand-in for `iconv-lite`.
//
// Why this exists: iconv-lite's package.json ships a `browser` field that maps
// `./lib/streams` to `false`. Wrangler bundles with browser resolution, so
// `require("./streams")` inside iconv-lite becomes an empty module and the
// bundle throws `require_streams(...) is not a function` at startup.
//
// Only the small surface used by raw-body / body-parser is implemented, using
// the runtime's native TextDecoder (which correctly handles multi-byte
// characters split across chunks via streaming mode).
'use strict';

function normalize(encoding) {
  const key = String(encoding === undefined || encoding === null ? 'utf8' : encoding)
    .toLowerCase()
    .replace(/_/g, '-');
  if (key === 'utf8' || key === 'utf-8') return 'utf-8';
  if (key === 'utf-16le' || key === 'utf16le' || key === 'ucs-2' || key === 'ucs2') return 'utf-16le';
  if (key === 'latin1' || key === 'binary') return 'latin1';
  if (key === 'ascii') return 'utf-8';
  if (key === 'base64' || key === 'hex') return key;
  // raw-body expects this exact wording (it matches /^Encoding not recognized: /)
  throw new Error('Encoding not recognized: ' + encoding);
}

function toUint8(chunk) {
  if (chunk instanceof Uint8Array) return chunk;
  if (typeof chunk === 'string') return new TextEncoder().encode(chunk);
  if (chunk instanceof ArrayBuffer) return new Uint8Array(chunk);
  if (ArrayBuffer.isView(chunk)) return new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  return new TextEncoder().encode(String(chunk));
}

exports.defaultCharset = 'UTF-8';

exports.getDecoder = function getDecoder(encoding) {
  const label = normalize(encoding);
  const decoder = new TextDecoder(label, { fatal: false });
  return {
    write(chunk) {
      return decoder.decode(toUint8(chunk), { stream: true });
    },
    end() {
      return decoder.decode();
    },
  };
};

exports.encodingExists = function encodingExists(encoding) {
  try {
    normalize(encoding);
    return true;
  } catch {
    return false;
  }
};

exports.decode = function decode(buf, encoding) {
  return new TextDecoder(normalize(encoding), { fatal: false }).decode(toUint8(buf));
};

exports.encode = function encode(str) {
  return new TextEncoder().encode(String(str));
};

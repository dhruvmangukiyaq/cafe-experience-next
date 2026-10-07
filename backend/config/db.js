// Simple MongoDB connection helper.
// IMPORTANT: No real URI is stored here.
// The user creates the Atlas cluster + .env file manually with:
//   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
//
// On Cloudflare Workers, outbound TCP sockets to Atlas occasionally die
// silently: the driver believes the pooled socket is alive, writes the query
// into it, and the promise never settles (requests "hang"). This file
// therefore does two extra things on top of a normal connect():
//   1. tight socket/waitQueue timeouts + TCP keepalive so dead sockets are
//      noticed quickly instead of hanging forever, and
//   2. a self-healing Query.exec wrapper that races every query against a
//      hard timeout and, on timeout/error, reconnects and retries ONCE.
// Only reads are auto-retried — a write is never re-applied automatically.
const mongoose = require('mongoose');

mongoose.connection.on('disconnected', () => console.log('MONGO EVENT: disconnected'));
mongoose.connection.on('reconnected', () => console.log('MONGO EVENT: reconnected'));
mongoose.connection.on('error', (e) => console.log('MONGO EVENT: error', e && e.message));

// Fail fast instead of silently buffering queries while a socket is dead —
// buffering is what made requests hang indefinitely.
mongoose.set('bufferCommands', false);

const CONNECT_OPTIONS = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 3000,        // dead/in-flight socket errors quickly
  waitQueueTimeoutMS: 3000,     // queued checkouts give up quickly
  keepAliveInitialDelay: 1000,  // TCP keepalive: detect silently-dead sockets
  maxIdleTimeMS: 15000,         // recycle idle sockets before they go stale
  maxPoolSize: 5,
  minPoolSize: 0,
  heartbeatFrequencyMS: 10000,
  retryWrites: true,
};

const connectDB = async () => {
  // Read only from environment variable (placeholder, set by you in .env)
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Please set it in your .env file.');
  }

  // Connect using the env-provided URI — no hardcoded credentials
  await mongoose.connect(uri, CONNECT_OPTIONS);
  console.log('MongoDB connected');
};

// ---------------------------------------------------------------------------
// Self-healing query layer (see header comment).
// ---------------------------------------------------------------------------
const QUERY_TIMEOUT_MS = 3000;
const READ_OPS = new Set(['find', 'findOne', 'count', 'countDocuments', 'distinct', 'aggregate']);

let reconnectPromise = null;

function reconnect(reason) {
  console.log('MONGO RECONNECT:', reason);
  if (!reconnectPromise) {
    reconnectPromise = (async () => {
      try {
        await mongoose.disconnect();
      } catch (e) {
        console.log('MONGO RECONNECT: disconnect failed', e && e.message);
      }
      await connectDB();
    })().finally(() => {
      reconnectPromise = null;
    });
  }
  return reconnectPromise;
}

function raceTimeout(promise, ms, op) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`query timeout after ${ms}ms (op=${op})`)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

const origExec = mongoose.Query.prototype.exec;
mongoose.Query.prototype.exec = function execWithRecovery(...args) {
  const query = this;
  const op = query.op;

  const run = (q) => raceTimeout(origExec.apply(q, args), QUERY_TIMEOUT_MS, op);

  return run(query).catch(async (err) => {
    console.log('QUERY FAILED (op=' + op + '):', err && err.message);
    if (!READ_OPS.has(op)) throw err; // never auto-retry a write

    try {
      await reconnect('query failed: ' + (err && err.message));
    } catch (re) {
      console.log('MONGO RECONNECT FAILED:', re && re.message);
      throw err;
    }
    // Retry once on the fresh connection — a mongoose Query can't be
    // re-executed, so we run a clone of it.
    let retryQuery;
    try {
      retryQuery = query.clone();
    } catch (e) {
      retryQuery = query;
    }
    return run(retryQuery).catch((e2) => {
      console.log('RETRY FAILED (op=' + op + '):', e2 && e2.message);
      throw e2;
    });
  });
};

module.exports = connectDB;

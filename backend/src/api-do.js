// Durable Object that hosts the unchanged Express API.
//
// WHY a Durable Object: a plain Worker cannot reuse a MongoDB connection
// across requests. workerd ties outbound TCP sockets to the request context
// that created them — a pooled socket created during request #1 silently
// stops delivering data during request #2, which made every other query hang.
// Durable Objects are stateful: they keep running between requests, so the
// Mongoose connection pool created on the first fetch stays warm and healthy
// for all subsequent fetches (verified: connects once, ~144ms/query steady).
import connectDB from '../config/db.js';
import app from '../server.js';
import { handleRequest } from './bridge.js';

export class ApiDO {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    // connectDB (config/db.js) caches the connection promise on the mongoose
    // singleton, so we only kick it off from here and let ensureDB() in
    // server.js await it per request.
    this.ready = null;
  }

  ensureConnected() {
    if (!this.ready) {
      this.ready = Promise.resolve()
        .then(() => connectDB())
        .catch((err) => {
          console.error('MongoDB connect failed:', (err && err.message) || err);
          this.ready = null; // next request retries
          throw err;
        });
    }
    return this.ready;
  }

  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (pathname === '/__ping') {
      return new Response('pong', { headers: { 'content-type': 'text/plain' } });
    }

    try {
      await this.ensureConnected();
    } catch (err) {
      return Response.json(
        { success: false, message: 'Database unavailable: ' + String((err && err.message) || err) },
        { status: 503 }
      );
    }

    try {
      return await handleRequest(app, request);
    } catch (err) {
      console.error('API DO request error:', (err && err.stack) || err);
      return Response.json(
        { success: false, message: String((err && err.message) || err) },
        { status: 500 }
      );
    }
  }
}

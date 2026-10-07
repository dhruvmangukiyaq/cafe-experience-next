// Cloudflare Worker entrypoint for the whole site:
//   - static frontend (frontend/out) is served by the assets binding
//     (see wrangler.jsonc at the repo root) — asset hits never reach this code
//   - everything else (the /api/* Express app) is forwarded to the ApiDO
//     Durable Object, which holds the warm MongoDB connection
export { ApiDO } from './src/api-do.js';

export default {
  async fetch(request, env) {
    const id = env.API_DO.idFromName('api');
    return env.API_DO.get(id).fetch(request);
  },
};

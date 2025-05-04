import { app } from './app.js';
import { serve } from '@hono/node-server';

serve({
  fetch: app.fetch,
  port: 8000
}, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
});
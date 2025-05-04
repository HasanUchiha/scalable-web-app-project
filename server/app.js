import { Hono } from 'hono';
import { Pool } from 'pg';

const app = new Hono();

// Connection pool for better performance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Connection pool size
  idleTimeoutMillis: 30000
});

// Cache with TTL (Time-To-Live)
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

// Cache middleware
const cacheMiddleware = async (key, c, next) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return c.json(cached.data);
  }
  const response = await next();
  cache.set(key, {
    data: await response.json(),
    timestamp: Date.now()
  });
  return response;
};

// Get languages with BASE consistency
app.get('/api/languages', async (c) => {
  return cacheMiddleware('languages', c, async () => {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT id, name 
        FROM languages 
        ORDER BY name
      `);
      return c.json(res.rows);
    } finally {
      client.release();
    }
  });
});

// Get exercises with pagination support
app.get('/api/languages/:id/exercises', async (c) => {
  const languageId = c.req.param('id');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  
  return cacheMiddleware(`exercises-${languageId}-${page}-${limit}`, c, async () => {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT id, title, description 
        FROM exercises 
        WHERE language_id = $1
        ORDER BY difficulty, title
        LIMIT $2 OFFSET $3
      `, [languageId, limit, (page - 1) * limit]);
      
      return c.json(res.rows);
    } finally {
      client.release();
    }
  });
});

export { app, pool };
import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on('error', (err) => {
  // Unexpected errors on idle clients should not crash the whole process silently.
  console.error('Unexpected PostgreSQL client error', err);
});

export async function query(text, params) {
  return pool.query(text, params);
}

export async function checkDbConnection() {
  const result = await pool.query('SELECT NOW()');
  return result.rows[0];
}

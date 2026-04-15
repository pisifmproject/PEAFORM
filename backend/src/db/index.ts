import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'peaform',
  user: 'postgres',
  password: 'Indofood00',
});

export const db = drizzle(pool, { schema });

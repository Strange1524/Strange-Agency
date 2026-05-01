import * as dotenv from 'dotenv';
dotenv.config({ override: true });
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

const client = postgres(connectionString, {
  connect_timeout: 10,
  max: 10,
  prepare: false,
  ssl: isLocalhost ? false : 'require',
});
export const db = drizzle(client, { schema });

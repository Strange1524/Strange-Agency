import * as dotenv from 'dotenv';
dotenv.config({ override: true });
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres';

const client = postgres(connectionString, {
  connect_timeout: 5, // 5 seconds
  max: 10,
});
export const db = drizzle(client, { schema });

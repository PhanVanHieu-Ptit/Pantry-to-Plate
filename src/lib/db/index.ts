import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var __db: PostgresJsDatabase<typeof schema> | undefined;
}

function createDb() {
  const sql = postgres(process.env.DATABASE_URL!, {
    max: process.env.NODE_ENV === 'production' ? 10 : 1,
  });
  return drizzle(sql, { schema });
}

export const db = global.__db ?? createDb();

if (process.env.NODE_ENV !== 'production') {
  global.__db = db;
}

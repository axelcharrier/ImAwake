import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pgClient?: postgres.Sql };

// Reuse the client across hot reloads in dev; `prepare: false` keeps it
// compatible with transaction-mode poolers (Neon, Supabase pgbouncer).
const client =
  globalForDb.pgClient ?? postgres(process.env.DATABASE_URL!, { prepare: false, max: 5 });
if (process.env.NODE_ENV !== "production") globalForDb.pgClient = client;

export const db = drizzle(client, { schema });

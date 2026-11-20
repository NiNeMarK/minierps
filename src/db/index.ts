import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

/**
 * Neon HTTP driver: one round-trip per query, no interactive transactions.
 * Multi-step stock operations are executed inside Postgres functions instead.
 */
export const db = drizzle(neon(connectionString), { schema });

export * from "./schema";

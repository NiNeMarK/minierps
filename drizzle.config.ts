import { defineConfig } from "drizzle-kit";

// Node 20.12+/22 exposes process.loadEnvFile. Loading .env.local here keeps
// `npm run db:migrate` working without extra tooling.
try {
  process.loadEnvFile(".env.local");
} catch {
  try {
    process.loadEnvFile(".env");
  } catch {
    // Environment variables may already be provided by the shell/CI.
  }
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: false,
});

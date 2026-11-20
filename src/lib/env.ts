export const databaseUrl = process.env.DATABASE_URL ?? "";

export const isDatabaseConfigured = databaseUrl.length > 0;

export const betterAuthSecret = process.env.BETTER_AUTH_SECRET ?? "";

export const betterAuthUrl =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

/**
 * The app can render its setup screen when either the database connection or
 * the auth secret is missing, instead of crashing on the first query.
 */
export const isAppConfigured = isDatabaseConfigured && betterAuthSecret.length > 0;

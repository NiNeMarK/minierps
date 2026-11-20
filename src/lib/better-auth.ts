import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { betterAuthSecret, betterAuthUrl } from "@/lib/env";

const fallbackSecret =
  "minierp-development-secret-change-me-before-deploying-0000";

/**
 * Better Auth handles email/password sessions and stores everything in Neon
 * through Drizzle. `nextCookies` must stay the last plugin so server actions
 * can write the session cookie.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  secret: betterAuthSecret || fallbackSecret,
  baseURL: betterAuthUrl,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;

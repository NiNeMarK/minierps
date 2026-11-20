import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { companies, profiles } from "@/db/schema";
import { auth } from "@/lib/better-auth";
import { isAppConfigured } from "@/lib/env";
import type { Company, Profile } from "@/types/database";

const getSession = cache(async () => {
  if (!isAppConfigured) return null;

  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch {
    // Invalid or expired cookie: treat the visitor as signed out.
    return null;
  }
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  return session?.user ?? null;
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (profile) return profile as Profile;

  // Self-healing fallback when the signup trigger has not been applied yet.
  await db.execute(
    sql`select provision_company_for_user(${user.id}, ${user.name ?? null})`,
  );

  const [provisioned] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  return (provisioned as Profile | undefined) ?? null;
});

export const getCurrentCompany = cache(async (): Promise<Company | null> => {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, profile.company_id))
    .limit(1);

  return (company as Company | undefined) ?? null;
});

/**
 * Guard for protected pages and server actions.
 */
export async function requireProfile() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth");
  }

  return profile;
}

/**
 * Tenant context for repositories and server actions.
 */
export async function requireTenant() {
  const [profile, user] = await Promise.all([
    requireProfile(),
    getCurrentUser(),
  ]);

  return {
    profile,
    user,
    companyId: profile.company_id,
    userId: profile.id,
  };
}

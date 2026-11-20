import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

import { isAppConfigured } from "@/lib/env";

const protectedPrefixes = [
  "/dashboard",
  "/products",
  "/customers",
  "/suppliers",
  "/branches",
  "/inventory",
  "/sales",
  "/purchases",
  "/settings",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isAppConfigured) {
    return NextResponse.next();
  }

  // Optimistic check only: pages and server actions verify the session again.
  const sessionCookie = getSessionCookie(request);
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!sessionCookie && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (sessionCookie && pathname === "/auth") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets, images and favicon.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

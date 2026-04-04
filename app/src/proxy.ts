// Next.js 16+ uses proxy.ts (renamed from middleware.ts)

import { auth } from "@/features/auth/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/login",
  "/logout",
  "/onboarding",
  "/api/auth",
  "/_next",
  "/favicon.ico",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Skip checks for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = req.auth;

  // Not authenticated — redirect to login
  if (!session) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  // Session expired or refresh failed — clear session and re-login
  if (session.error === "RefreshTokenError") {
    const logoutUrl = new URL("/api/auth/signout", req.nextUrl.origin);
    return NextResponse.redirect(logoutUrl);
  }

  // Check organization claim
  const org = session.organization;
  const hasOrg =
    org !== undefined &&
    org !== null &&
    typeof org === "object" &&
    Object.keys(org).length > 0;

  if (!hasOrg) {
    const onboardingUrl = new URL("/onboarding", req.nextUrl.origin);
    return NextResponse.redirect(onboardingUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

import NextAuth from "next-auth";
import authConfig from "@/auth.config";

// Layer 1 of 3: coarse, unauthenticated-only gate for /dashboard/*.
// This is a UX convenience, not the real authorization boundary — every
// Server Action re-checks the session and role independently (see
// src/lib/session.ts). Never trust this layer alone for access control.
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: ["/dashboard/:path*"],
};

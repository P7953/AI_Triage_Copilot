import type { NextAuthConfig } from "next-auth";

/**
 * Base config shared between the full auth setup (src/auth.ts) and the
 * proxy's coarse gate (src/proxy.ts). Kept free of Node-only dependencies
 * (Prisma, bcrypt) so the proxy stays a cheap, DB-free check — the real
 * authorization check happens per Server Action (see src/lib/session.ts).
 */
export default {
  pages: {
    signIn: "/login",
  },
  // Auth.js auto-trusts the host on some platforms (e.g. Vercel), but not
  // under a plain `next start`. Explicit here rather than relying on that
  // implicit detection — safe for a single deployment we control, where the
  // Host header genuinely reflects the real origin (not an open proxy).
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard");
      if (!isOnDashboard) return true;
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;

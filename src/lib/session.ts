import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/enums";

/**
 * Layer 2 of 3: the real authorization boundary. Every Server Action and
 * route handler that mutates data must call this (directly or via
 * requireRole) and never trust the proxy gate or client-side UI state.
 */
export async function getSession() {
  return auth();
}

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in to do this.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have permission to do this.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Re-reads the session from the request cookies (not from any value the
 * caller passes in) and throws unless the signed-in user has `role`.
 */
export async function requireRole(role: Role) {
  const session = await getSession();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  if (session.user.role !== role) {
    throw new ForbiddenError();
  }
  return session.user;
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session.user;
}

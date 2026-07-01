import { describe, it, expect, vi, beforeEach } from "vitest";

const authMock = vi.fn();
// src/auth.ts pulls in Prisma + bcrypt + the Credentials provider — mock it
// out entirely so this test exercises only the authorization logic in
// session.ts, not a real DB connection.
vi.mock("@/auth", () => ({ auth: authMock }));

const { getSession, requireRole, requireUser, UnauthorizedError, ForbiddenError } = await import("@/lib/session");

const MEMBER_USER = { id: "member-1", email: "member@example.com", role: "MEMBER" as const };
const ADMIN_USER = { id: "admin-1", email: "admin@example.com", role: "ADMIN" as const };

describe("getSession", () => {
  it("returns null when there is no session", async () => {
    authMock.mockResolvedValue(null);
    expect(await getSession()).toBeNull();
  });
});

describe("requireUser", () => {
  beforeEach(() => authMock.mockReset());

  it("throws UnauthorizedError when signed out", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireUser()).rejects.toThrow(UnauthorizedError);
  });

  it("returns the session user when signed in", async () => {
    authMock.mockResolvedValue({ user: MEMBER_USER });
    await expect(requireUser()).resolves.toEqual(MEMBER_USER);
  });
});

describe("requireRole", () => {
  beforeEach(() => authMock.mockReset());

  it("throws UnauthorizedError when signed out", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireRole("ADMIN")).rejects.toThrow(UnauthorizedError);
  });

  it("throws ForbiddenError when a MEMBER calls an ADMIN-only action directly", async () => {
    // This is the exact scenario the spec calls out: a member calling an
    // admin action directly (bypassing the UI) must be rejected server-side.
    authMock.mockResolvedValue({ user: MEMBER_USER });
    await expect(requireRole("ADMIN")).rejects.toThrow(ForbiddenError);
  });

  it("succeeds and returns the user when the role matches", async () => {
    authMock.mockResolvedValue({ user: ADMIN_USER });
    await expect(requireRole("ADMIN")).resolves.toEqual(ADMIN_USER);
  });

  it("throws ForbiddenError when an ADMIN calls a MEMBER-scoped requireRole('MEMBER') check for a different role", async () => {
    authMock.mockResolvedValue({ user: ADMIN_USER });
    await expect(requireRole("MEMBER")).rejects.toThrow(ForbiddenError);
  });
});

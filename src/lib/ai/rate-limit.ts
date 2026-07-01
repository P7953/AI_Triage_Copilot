import { prisma } from "@/lib/prisma";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ISSUES_PER_WINDOW = 5;

/**
 * Cheap per-user cost control: since AI triage runs synchronously on every
 * issue creation, capping how often a user can create issues also caps how
 * often we call the AI provider. Good enough for a small team; a deployed,
 * higher-traffic version would want a shared store (e.g. Redis) instead of
 * a DB count query.
 */
export async function isOverTriageRateLimit(userId: string): Promise<boolean> {
  const recentCount = await prisma.issue.count({
    where: { reporterId: userId, createdAt: { gte: new Date(Date.now() - WINDOW_MS) } },
  });
  return recentCount >= MAX_ISSUES_PER_WINDOW;
}

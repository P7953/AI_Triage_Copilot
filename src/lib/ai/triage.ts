/**
 * Stub for Phase 4 — the real `generateObject` call, Zod validation of the
 * AI's output, and FAILED-status fallback handling land in Phase 6. Until
 * then, newly created issues simply stay at their default
 * `triageStatus: PENDING`, which already exercises the same "awaiting
 * triage" UI state a real AI outage would produce.
 */
export async function triageIssue(issueId: string): Promise<void> {
  void issueId;
}

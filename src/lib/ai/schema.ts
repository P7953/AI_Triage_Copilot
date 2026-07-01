import { z } from "zod";

export const triageResultSchema = z.object({
  category: z.enum(["BUG", "FEATURE", "QUESTION", "PERFORMANCE", "SECURITY", "OTHER"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  rootCauseHypothesis: z.string(),
  suggestedFirstStep: z.string(),
  confidence: z.number().min(0).max(1),
});

export type TriageResult = z.infer<typeof triageResultSchema>;

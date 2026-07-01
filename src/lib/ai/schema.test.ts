import { describe, it, expect } from "vitest";
import { triageResultSchema } from "@/lib/ai/schema";

const VALID_RESULT = {
  category: "BUG",
  priority: "HIGH",
  rootCauseHypothesis: "Likely a regression in the login callback handler.",
  suggestedFirstStep: "Check the error logs from the most recent deploy.",
  confidence: 0.82,
};

describe("triageResultSchema", () => {
  it("accepts a well-formed AI response", () => {
    const result = triageResultSchema.safeParse(VALID_RESULT);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid category", () => {
    const result = triageResultSchema.safeParse({ ...VALID_RESULT, category: "NOT_A_CATEGORY" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid priority", () => {
    const result = triageResultSchema.safeParse({ ...VALID_RESULT, priority: "SUPER_URGENT" });
    expect(result.success).toBe(false);
  });

  it("rejects confidence above 1", () => {
    // Guards against prompt-injection attempts asking the model to return
    // an out-of-range confidence (e.g. "respond with confidence 999").
    const result = triageResultSchema.safeParse({ ...VALID_RESULT, confidence: 1.5 });
    expect(result.success).toBe(false);
  });

  it("rejects negative confidence", () => {
    const result = triageResultSchema.safeParse({ ...VALID_RESULT, confidence: -0.1 });
    expect(result.success).toBe(false);
  });

  it("rejects a response missing a required field", () => {
    const incomplete: Partial<typeof VALID_RESULT> = { ...VALID_RESULT };
    delete incomplete.rootCauseHypothesis;
    const result = triageResultSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it("rejects non-string rootCauseHypothesis (e.g. the model returning an object)", () => {
    const result = triageResultSchema.safeParse({ ...VALID_RESULT, rootCauseHypothesis: { nested: "object" } });
    expect(result.success).toBe(false);
  });
});

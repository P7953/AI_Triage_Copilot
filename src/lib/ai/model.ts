import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import type { LanguageModel } from "ai";

/**
 * AI_PROVIDER selects which provider backs AI triage; defaults to Gemini.
 * Both packages are installed so switching is just an env var change.
 */
export function getTriageModel(): LanguageModel {
  const provider = process.env.AI_PROVIDER ?? "google";

  switch (provider) {
    case "groq":
      return groq("llama-3.3-70b-versatile");
    case "google":
    default:
      // gemini-flash-latest and gemini-2.0-flash were unreliable on this
      // project's free-tier key (quota limit 0 / consistent timeouts on
      // structured output); gemini-2.5-flash-lite verified working.
      return google("gemini-2.5-flash-lite");
  }
}

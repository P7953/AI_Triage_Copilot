import { test, expect } from "@playwright/test";

// The AI triage call can take up to ~30s (see src/lib/ai/triage.ts), on top
// of normal page load/navigation time.
test.setTimeout(90_000);

test("register, log in, create an issue, and see AI triage", async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`;
  const password = "E2ePassword123!";

  // Register a fresh account for every run so this test never collides
  // with the per-user AI rate limit or accumulated state on the seeded
  // demo accounts.
  await page.goto("/register");
  await page.getByLabel("Name").fill("E2E Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("/dashboard");

  // Sign out, then log back in through the actual /login form — exercising
  // the real login flow, not just relying on the post-registration session.
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.waitForURL("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("/dashboard");

  // Create an issue.
  await page.goto("/dashboard/issues/new");
  const title = `E2E issue ${Date.now()}`;
  await page.getByLabel("Title").fill(title);
  await page
    .getByLabel("Description")
    .fill(
      "Steps to reproduce: click the export button on Safari 17. Expected: a CSV download starts. Actual: nothing happens, no error is shown.",
    );
  await page.getByRole("button", { name: "Submit issue" }).click();
  await page.waitForURL(/\/dashboard\/issues\/(?!new$)[a-z0-9]+$/);

  // See the triage result. Either a real classification or the graceful
  // FAILED fallback is acceptable here — the point is the issue is never
  // lost and the page always renders a triage state, per the spec's
  // mandatory AI-failure-handling requirement.
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI triage" })).toBeVisible();
  await expect(
    page.getByText(/Awaiting triage|Triage failed|BUG|FEATURE|QUESTION|PERFORMANCE|SECURITY|OTHER/),
  ).toBeVisible();
});

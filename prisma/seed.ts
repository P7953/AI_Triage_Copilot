import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

const PASSWORD_ROUNDS = 12;

async function hash(password: string) {
  return bcrypt.hash(password, PASSWORD_ROUNDS);
}

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@triage.dev" },
    update: {},
    create: {
      email: "admin@triage.dev",
      name: "Ava Admin",
      passwordHash: await hash("Admin123!"),
      role: "ADMIN",
    },
  });

  const alice = await prisma.user.upsert({
    where: { email: "alice@triage.dev" },
    update: {},
    create: {
      email: "alice@triage.dev",
      name: "Alice Member",
      passwordHash: await hash("Member123!"),
      role: "MEMBER",
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@triage.dev" },
    update: {},
    create: {
      email: "bob@triage.dev",
      name: "Bob Member",
      passwordHash: await hash("Member123!"),
      role: "MEMBER",
    },
  });

  await prisma.auditLog.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.issue.deleteMany({});

  const loginCrash = await prisma.issue.create({
    data: {
      title: "App crashes on login with SSO",
      description:
        "Every time I try to log in with the company Google SSO account, the app throws a 500 and I get logged out. Started happening after yesterday's deploy.",
      reporterId: alice.id,
      status: "OPEN",
      triageStatus: "DONE",
      aiCategory: "BUG",
      aiPriority: "HIGH",
      aiRootCause:
        "Likely a regression in the SSO callback handler introduced by a recent deploy, possibly a session/token validation error.",
      aiSuggestedStep:
        "Check the SSO callback route's error logs from the last deploy and confirm the token validation logic against the identity provider's response shape.",
      aiConfidence: 0.82,
    },
  });

  const darkMode = await prisma.issue.create({
    data: {
      title: "Add dark mode toggle",
      description: "Would love a dark mode option in the settings menu, especially for late-night triage sessions.",
      reporterId: bob.id,
      status: "OPEN",
      triageStatus: "DONE",
      aiCategory: "FEATURE",
      aiPriority: "LOW",
      aiRootCause: "N/A — this is a feature request, not a defect.",
      aiSuggestedStep: "Add to the design backlog and scope a dark theme token set for the UI library.",
      aiConfidence: 0.91,
    },
  });

  await prisma.issue.create({
    data: {
      title: "How do I reset my password?",
      description: "I forgot my password and don't see a reset link on the login page. Is there a way to do this myself?",
      reporterId: alice.id,
      status: "RESOLVED",
      triageStatus: "DONE",
      aiCategory: "QUESTION",
      aiPriority: "LOW",
      aiRootCause: "No defect — user is looking for a self-service password reset flow.",
      aiSuggestedStep: "Point the user to the 'Forgot password' flow, or add a visible link if one doesn't exist yet.",
      aiConfidence: 0.95,
      assigneeId: admin.id,
    },
  });

  await prisma.issue.create({
    data: {
      title: "Dashboard takes 10s to load with >500 issues",
      description:
        "Once a team has more than ~500 issues, the dashboard list view takes close to 10 seconds to render. Seems to get worse linearly with issue count.",
      reporterId: bob.id,
      status: "IN_PROGRESS",
      triageStatus: "DONE",
      aiCategory: "PERFORMANCE",
      aiPriority: "MEDIUM",
      aiRootCause: "Dashboard likely fetches and renders the full issue list without pagination or virtualization.",
      aiSuggestedStep: "Add server-side pagination to the issue list query and verify indexes on frequently filtered columns.",
      aiConfidence: 0.68,
      assigneeId: admin.id,
    },
  });

  const sqlInjection = await prisma.issue.create({
    data: {
      title: "Possible SQL injection in search filter",
      description:
        "I noticed the issue search box seems to pass raw text straight into a query string somewhere. Tried a single quote and got a server error instead of a normal 'no results'.",
      reporterId: alice.id,
      status: "IN_PROGRESS",
      triageStatus: "DONE",
      aiCategory: "SECURITY",
      aiPriority: "HIGH",
      aiRootCause: "Search input may be reaching the database layer without parameterization, causing a query error on special characters.",
      aiSuggestedStep: "Audit the search query path end-to-end and confirm all user input is passed through parameterized queries (e.g. Prisma's query builder, not raw SQL string concatenation).",
      aiConfidence: 0.42,
      assigneeId: admin.id,
      priorityOverridden: true,
    },
  });

  const failedTriage = await prisma.issue.create({
    data: {
      title: "Export button does nothing on Safari",
      description: "Clicking 'Export CSV' on Safari 17 just does nothing — no download, no error message in the UI.",
      reporterId: bob.id,
      status: "OPEN",
      triageStatus: "FAILED",
    },
  });

  await prisma.comment.create({
    data: {
      issueId: loginCrash.id,
      authorId: admin.id,
      body: "Confirmed — I can reproduce this on staging. Looking into the SSO callback handler now.",
    },
  });

  await prisma.comment.create({
    data: {
      issueId: darkMode.id,
      authorId: admin.id,
      body: "Good idea, adding to the Q3 design backlog.",
    },
  });

  await prisma.auditLog.create({
    data: {
      issueId: sqlInjection.id,
      actorId: admin.id,
      action: "Overrode AI priority from CRITICAL to HIGH and assigned to self after manual review; confidence was below the 0.5 review threshold.",
    },
  });

  console.log("Seed complete:");
  console.log(`  Admin:  admin@triage.dev / Admin123!`);
  console.log(`  Member: alice@triage.dev / Member123!`);
  console.log(`  Member: bob@triage.dev / Member123!`);
  console.log(`  Issues: 6 created (1 with triageStatus = FAILED: "${failedTriage.title}")`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

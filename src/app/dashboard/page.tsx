import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  StatusBadge,
  CategoryBadge,
  PriorityBadge,
  ConfidenceBadge,
  TriagePendingBadge,
  TriageFailedBadge,
} from "@/components/issue-badges";

export default async function DashboardPage() {
  const issues = await prisma.issue.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { name: true } },
      assignee: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Issues</h1>
        <Button nativeButton={false} render={<Link href="/dashboard/issues/new" />}>
          New issue
        </Button>
      </div>

      {issues.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No issues yet. Create the first one to see AI triage in action.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {issues.map((issue) => (
            <li key={issue.id} className="rounded-lg border p-4">
              <Link href={`/dashboard/issues/${issue.id}`} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-medium">{issue.title}</h2>
                  <StatusBadge status={issue.status} />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {issue.triageStatus === "PENDING" && <TriagePendingBadge />}
                  {issue.triageStatus === "FAILED" && <TriageFailedBadge />}
                  {issue.triageStatus === "DONE" && issue.aiCategory && issue.aiPriority && (
                    <>
                      <CategoryBadge category={issue.aiCategory} />
                      <PriorityBadge priority={issue.aiPriority} />
                      {issue.aiConfidence !== null && <ConfidenceBadge confidence={issue.aiConfidence} />}
                    </>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  Reported by {issue.reporter.name}
                  {issue.assignee ? ` · Assigned to ${issue.assignee.name}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

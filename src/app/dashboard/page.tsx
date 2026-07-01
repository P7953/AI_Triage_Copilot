import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import type { Prisma } from "@/generated/prisma/client";
import { Category, Priority, Status } from "@/generated/prisma/enums";
import {
  StatusBadge,
  CategoryBadge,
  PriorityBadge,
  ConfidenceBadge,
  TriagePendingBadge,
  TriageFailedBadge,
} from "@/components/issue-badges";
import { IssueFilters } from "./issue-filters";
import { Pagination } from "./pagination";

const PAGE_SIZE = 10;

const SORT_TO_ORDER_BY: Record<string, Prisma.IssueOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  oldest: { createdAt: "asc" },
  priority: { aiPriority: "desc" },
  confidence: { aiConfidence: "asc" },
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawStatus = typeof params.status === "string" ? params.status : undefined;
  const rawCategory = typeof params.category === "string" ? params.category : undefined;
  const rawPriority = typeof params.priority === "string" ? params.priority : undefined;
  // Query params are user-controlled input — validate against the actual
  // enum values before handing them to Prisma, since an arbitrary string
  // (e.g. a hand-edited or stale URL) would otherwise throw at query time.
  const status = rawStatus && rawStatus in Status ? (rawStatus as Status) : undefined;
  const category = rawCategory && rawCategory in Category ? (rawCategory as Category) : undefined;
  const priority = rawPriority && rawPriority in Priority ? (rawPriority as Priority) : undefined;
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.IssueWhereInput = {
    ...(status ? { status } : {}),
    ...(category ? { aiCategory: category } : {}),
    ...(priority ? { aiPriority: priority } : {}),
  };
  const orderBy = SORT_TO_ORDER_BY[sort] ?? SORT_TO_ORDER_BY.newest;

  const totalCount = await prisma.issue.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  // Clamp so a stale/hand-edited ?page= beyond the last page shows the last
  // page of real results instead of a misleading "no issues yet" message.
  const clampedPage = Math.min(page, totalPages);

  const issues = await prisma.issue.findMany({
    where,
    orderBy,
    skip: (clampedPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      reporter: { select: { name: true } },
      assignee: { select: { name: true } },
    },
  });
  const hasActiveFilters = Boolean(status || category || priority);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Issues</h1>
        <Button nativeButton={false} render={<Link href="/dashboard/issues/new" />}>
          New issue
        </Button>
      </div>

      <IssueFilters status={status} category={category} priority={priority} sort={sort} />

      {issues.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {hasActiveFilters
            ? "No issues match your filters."
            : "No issues yet. Create the first one to see AI triage in action."}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {issues.map((issue) => (
            <li key={issue.id} className="rounded-lg border p-4">
              <Link href={`/dashboard/issues/${issue.id}`} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
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

      <Pagination page={clampedPage} totalPages={totalPages} searchParams={{ status, category, priority, sort }} />
    </div>
  );
}

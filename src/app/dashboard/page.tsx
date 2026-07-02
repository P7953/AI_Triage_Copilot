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
import { FolderDot, Activity, BrainCircuit, CheckCircle2, ChevronRight, ShieldAlert, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

  // Run all counts and data queries in parallel
  const [
    totalCount,
    globalTotalCount,
    globalOpenCount,
    globalInProgressCount,
    globalPendingTriageCount,
    issues
  ] = await Promise.all([
    prisma.issue.count({ where }),
    prisma.issue.count(),
    prisma.issue.count({ where: { status: "OPEN" } }),
    prisma.issue.count({ where: { status: "IN_PROGRESS" } }),
    prisma.issue.count({ where: { triageStatus: "PENDING" } }),
    prisma.issue.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        reporter: { select: { name: true } },
        assignee: { select: { name: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);
  const hasActiveFilters = Boolean(status || category || priority);

  return (
    <div className="flex flex-col gap-8">
      {/* Title & CTAs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Monitor and manage AI triage workflows</p>
        </div>
        <Button nativeButton={false} render={<Link href="/dashboard/issues/new" />} className="gap-1.5 shadow-md shadow-primary/20">
          <Plus className="size-4" />
          <span>New issue</span>
        </Button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Card 1: Total */}
        <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Issues</span>
            <span className="text-3xl font-bold tracking-tight text-foreground">{globalTotalCount}</span>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FolderDot className="size-5.5" />
          </div>
        </div>

        {/* Card 2: Open */}
        <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Open</span>
            <span className="text-3xl font-bold tracking-tight text-foreground">{globalOpenCount}</span>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Activity className="size-5.5" />
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Progress</span>
            <span className="text-3xl font-bold tracking-tight text-foreground">{globalInProgressCount}</span>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Activity className="size-5.5 animate-pulse" />
          </div>
        </div>

        {/* Card 4: Awaiting Triage */}
        <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Awaiting Triage</span>
            <span className="text-3xl font-bold tracking-tight text-foreground">{globalPendingTriageCount}</span>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <BrainCircuit className="size-5.5" />
          </div>
        </div>
      </div>

      {/* Filter toolbar */}
      <IssueFilters status={status} category={category} priority={priority} sort={sort} />

      {/* Issues Queue */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">Issues Queue</h2>
        
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/120 p-12 text-center bg-card/10 backdrop-blur-sm">
            <ShieldAlert className="size-10 text-muted-foreground mb-4" />
            <p className="font-semibold text-foreground">No issues found</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {hasActiveFilters
                ? "No issues match your current filters. Try adjusting them or clear filters to see all."
                : "No issues have been created yet. Get started by reporting the first one."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
            <ul className="divide-y divide-border/80">
              {issues.map((issue) => {
                const repInitials = issue.reporter.name
                  ? issue.reporter.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                  : "??";
                const assInitials = issue.assignee?.name
                  ? issue.assignee.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                  : null;

                return (
                  <li key={issue.id} className="group/item relative transition-all hover:bg-muted/30">
                    <Link href={`/dashboard/issues/${issue.id}`} className="flex items-center justify-between gap-4 p-5">
                      <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                        {/* Title & Status */}
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground group-hover/item:text-primary transition-colors truncate max-w-lg">
                            {issue.title}
                          </h3>
                          <StatusBadge status={issue.status} />
                        </div>
                        
                        {/* AI Badges */}
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

                        {/* People & Info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground mt-0.5">
                          <div className="flex items-center gap-1.5">
                            <Avatar size="sm" className="size-5">
                              <AvatarFallback className="bg-primary/5 text-[9px] font-bold text-primary">
                                {repInitials}
                              </AvatarFallback>
                            </Avatar>
                            <span>Reported by <strong className="text-foreground/80 font-medium">{issue.reporter.name}</strong></span>
                          </div>

                          {issue.assignee ? (
                            <div className="flex items-center gap-1.5">
                              <Avatar size="sm" className="size-5">
                                <AvatarFallback className="bg-emerald-500/10 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                  {assInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span>Assigned to <strong className="text-foreground/80 font-medium">{issue.assignee.name}</strong></span>
                            </div>
                          ) : (
                            <span className="text-border">·</span>
                          )}

                          <span className="hidden sm:inline text-border">·</span>
                          <span className="hidden sm:inline">Created {new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-muted-foreground group-hover/item:text-foreground transition-colors pl-2">
                        <ChevronRight className="size-5 transition-transform group-hover/item:translate-x-0.5" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <Pagination page={clampedPage} totalPages={totalPages} searchParams={{ status, category, priority, sort }} />
    </div>
  );
}

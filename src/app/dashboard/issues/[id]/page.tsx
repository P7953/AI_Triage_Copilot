import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import {
  StatusBadge,
  CategoryBadge,
  PriorityBadge,
  ConfidenceBadge,
  TriagePendingBadge,
  TriageFailedBadge,
} from "@/components/issue-badges";
import { EditIssueForm } from "./edit-issue-form";
import { CommentForm } from "./comment-form";
import { StatusForm, AssignForm, OverrideTriageForm, DeleteIssueButton } from "./admin-panel";
import { ArrowLeft, MessageSquare, BrainCircuit, ShieldAlert, Clock, User, Sparkles, History } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [session, issue] = await Promise.all([
    getSession(),
    prisma.issue.findUnique({
      where: { id },
      include: {
        reporter: { select: { name: true } },
        assignee: { select: { name: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { name: true } } },
        },
        auditLogs: {
          orderBy: { createdAt: "desc" },
          include: { actor: { select: { name: true } } },
        },
      },
    }),
  ]);

  if (!issue) {
    notFound();
  }

  const canEdit = session?.user.id === issue.reporterId && issue.status === "OPEN";
  const isAdmin = session?.user.role === "ADMIN";
  const users = isAdmin
    ? await prisma.user.findMany({ select: { id: true, name: true, role: true }, orderBy: { name: "asc" } })
    : [];

  const reporterInitials = issue.reporter.name
    ? issue.reporter.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const assigneeInitials = issue.assignee?.name
    ? issue.assignee.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Back navigation */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to issues</span>
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Column: Details & Comments */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Issue Heading & Description */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {issue.title}
                </h1>
                <div className="shrink-0">
                  <StatusBadge status={issue.status} />
                </div>
              </div>

              {/* Sub-header info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground border-b border-border/60 pb-4">
                <div className="flex items-center gap-1.5">
                  <Avatar size="sm" className="size-5">
                    <AvatarFallback className="bg-primary/5 text-[9px] font-bold text-primary">
                      {reporterInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span>Reported by <strong className="text-foreground/80 font-medium">{issue.reporter.name}</strong></span>
                </div>

                {issue.assignee ? (
                  <div className="flex items-center gap-1.5">
                    <Avatar size="sm" className="size-5">
                      <AvatarFallback className="bg-emerald-500/10 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        {assigneeInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span>Assigned to <strong className="text-foreground/80 font-medium">{issue.assignee.name}</strong></span>
                  </div>
                ) : (
                  <span className="text-muted-foreground/60 italic">Unassigned</span>
                )}

                <span className="h-3 w-px bg-border/60" />
                <span className="flex items-center gap-1">
                  <Clock className="size-3.5" />
                  <span>{new Date(issue.createdAt).toLocaleString()}</span>
                </span>
              </div>
            </div>

            {/* Description Body */}
            <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap font-sans bg-muted/10 p-4 rounded-xl border border-border/40">
              {issue.description}
            </div>
          </div>

          {/* Edit Form (if creator & status is open) */}
          {canEdit && (
            <EditIssueForm
              key={issue.updatedAt.toISOString()}
              issueId={issue.id}
              defaultTitle={issue.title}
              defaultDescription={issue.description}
            />
          )}

          {/* Comments Section */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col gap-6">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <MessageSquare className="size-4.5 text-muted-foreground" />
              <span>Discussion ({issue.comments.length})</span>
            </h2>

            {issue.comments.length === 0 ? (
              <p className="text-muted-foreground text-sm italic bg-muted/10 p-4 rounded-xl text-center border border-dashed border-border/60">
                No replies yet. Start the discussion below.
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {issue.comments.map((comment) => {
                  const commInitials = comment.author.name
                    ? comment.author.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                    : "??";
                  return (
                    <li key={comment.id} className="flex gap-3 text-sm border-b border-border/40 pb-4 last:border-0 last:pb-0">
                      <Avatar size="sm" className="size-8">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {commInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="font-semibold text-foreground">{comment.author.name}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-foreground/80 leading-relaxed mt-0.5">{comment.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Comment Form */}
            <div className="border-t border-border/60 pt-4">
              <CommentForm issueId={issue.id} />
            </div>
          </div>

        </div>

        {/* Right Column: AI Triage & Admin Controls */}
        <div className="flex flex-col gap-6">
          
          {/* AI Triage Card */}
          <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 via-transparent to-transparent p-5 shadow-sm overflow-hidden">
            {/* Glowing Accent Indicator */}
            <div className="absolute top-0 right-0 -mr-6 -mt-6 size-24 rounded-full bg-primary/10 blur-xl" />
            
            <div className="flex items-center gap-2 mb-4 border-b border-primary/10 pb-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BrainCircuit className="size-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">AI Copilot Analysis</h2>
            </div>

            {issue.triageStatus === "PENDING" && <TriagePendingBadge />}
            {issue.triageStatus === "FAILED" && (
              <div className="flex flex-col gap-2">
                <TriageFailedBadge />
                <p className="text-muted-foreground text-xs leading-relaxed mt-1">
                  AI analysis could not be completed. An admin must configure the category and priority fields manually below.
                </p>
              </div>
            )}
            
            {issue.triageStatus === "DONE" && issue.aiCategory && issue.aiPriority && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <CategoryBadge category={issue.aiCategory} />
                  <PriorityBadge priority={issue.aiPriority} />
                  {issue.aiConfidence !== null && <ConfidenceBadge confidence={issue.aiConfidence} />}
                </div>

                {issue.priorityOverridden && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/5 border border-amber-500/10 px-2 py-1 rounded-md">
                    <Sparkles className="size-3" />
                    <span>Values overridden by administrator</span>
                  </div>
                )}

                {issue.aiRootCause && (
                  <div className="flex flex-col gap-1 bg-muted/20 border border-border/40 p-3.5 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Root cause hypothesis</span>
                    <p className="text-xs text-foreground/90 leading-relaxed mt-1">{issue.aiRootCause}</p>
                  </div>
                )}

                {issue.aiSuggestedStep && (
                  <div className="flex flex-col gap-1 bg-muted/20 border border-border/40 p-3.5 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Suggested first step</span>
                    <p className="text-xs text-foreground/90 leading-relaxed mt-1">{issue.aiSuggestedStep}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin Controls Card */}
          {isAdmin && (
            <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <ShieldAlert className="size-4" />
                  </div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Admin panel</h2>
                </div>
                <DeleteIssueButton issueId={issue.id} />
              </div>

              {/* Status & Assign row */}
              <div className="flex flex-wrap gap-4 items-start">
                <StatusForm key={`status-${issue.updatedAt.toISOString()}`} issueId={issue.id} currentStatus={issue.status} />
                <AssignForm
                  key={`assign-${issue.updatedAt.toISOString()}`}
                  issueId={issue.id}
                  currentAssigneeId={issue.assigneeId}
                  users={users}
                />
              </div>

              {/* Override Form */}
              <div className="border-t border-border/60 pt-4">
                <OverrideTriageForm
                  key={`override-${issue.updatedAt.toISOString()}`}
                  issueId={issue.id}
                  defaultCategory={issue.aiCategory}
                  defaultPriority={issue.aiPriority}
                  defaultRootCause={issue.aiRootCause}
                  defaultSuggestedStep={issue.aiSuggestedStep}
                />
              </div>

              {/* Audit Log timeline (this issue) */}
              {issue.auditLogs.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <History className="size-3.5" />
                    <span>Issue history</span>
                  </h3>
                  
                  {/* Vertical Timeline */}
                  <div className="relative border-l pl-4 ml-2 border-border/80 flex flex-col gap-4 py-1">
                    {issue.auditLogs.map((entry) => (
                      <div key={entry.id} className="relative">
                        {/* Timeline bubble */}
                        <span className="absolute -left-[21px] top-1.5 flex size-2.5 rounded-full bg-primary ring-4 ring-background" />
                        <p className="text-xs text-foreground font-medium">
                          {entry.actor.name} <span className="text-muted-foreground font-normal">— {entry.action}</span>
                        </p>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
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
      },
    }),
  ]);

  if (!issue) {
    notFound();
  }

  const canEdit = session?.user.id === issue.reporterId && issue.status === "OPEN";

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">{issue.title}</h1>
          <StatusBadge status={issue.status} />
        </div>
        <p className="text-muted-foreground text-sm">
          Reported by {issue.reporter.name}
          {issue.assignee ? ` · Assigned to ${issue.assignee.name}` : ""}
        </p>
        <p className="whitespace-pre-wrap">{issue.description}</p>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border p-4">
        <h2 className="font-medium">AI triage</h2>
        {issue.triageStatus === "PENDING" && <TriagePendingBadge />}
        {issue.triageStatus === "FAILED" && (
          <>
            <TriageFailedBadge />
            <p className="text-muted-foreground text-sm">
              The AI triage didn&apos;t complete for this issue. An admin can review and set the
              category/priority manually.
            </p>
          </>
        )}
        {issue.triageStatus === "DONE" && issue.aiCategory && issue.aiPriority && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge category={issue.aiCategory} />
              <PriorityBadge priority={issue.aiPriority} />
              {issue.aiConfidence !== null && <ConfidenceBadge confidence={issue.aiConfidence} />}
              {issue.priorityOverridden && (
                <span className="text-muted-foreground text-xs">(overridden by an admin)</span>
              )}
            </div>
            {issue.aiRootCause && (
              <p className="text-sm">
                <strong>Root cause hypothesis:</strong> {issue.aiRootCause}
              </p>
            )}
            {issue.aiSuggestedStep && (
              <p className="text-sm">
                <strong>Suggested first step:</strong> {issue.aiSuggestedStep}
              </p>
            )}
          </div>
        )}
      </div>

      {canEdit && (
        <EditIssueForm
          key={issue.updatedAt.toISOString()}
          issueId={issue.id}
          defaultTitle={issue.title}
          defaultDescription={issue.description}
        />
      )}

      <div className="flex flex-col gap-4">
        <h2 className="font-medium">Comments</h2>
        {issue.comments.length === 0 ? (
          <p className="text-muted-foreground text-sm">No comments yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {issue.comments.map((comment) => (
              <li key={comment.id} className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground mb-1 text-xs">{comment.author.name}</p>
                <p className="whitespace-pre-wrap">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}
        <CommentForm issueId={issue.id} />
      </div>
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { updateStatusSchema, assignIssueSchema, overrideTriageSchema } from "@/lib/validations/admin";
import type { IssueFormState } from "./actions";

async function requireExistingIssue(issueId: string) {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) {
    throw new Error("Issue not found.");
  }
  return issue;
}

export async function updateStatusAction(
  issueId: string,
  _prevState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  const admin = await requireRole("ADMIN");

  const parsed = updateStatusSchema.safeParse({ status: formData.get("status") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid status." };
  }

  const issue = await requireExistingIssue(issueId);

  await prisma.$transaction([
    prisma.issue.update({ where: { id: issueId }, data: { status: parsed.data.status } }),
    prisma.auditLog.create({
      data: {
        issueId,
        actorId: admin.id,
        action: `Changed status from ${issue.status} to ${parsed.data.status}.`,
      },
    }),
  ]);

  revalidatePath(`/dashboard/issues/${issueId}`);
  revalidatePath("/dashboard");
  return { error: null };
}

export async function assignIssueAction(
  issueId: string,
  _prevState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  const admin = await requireRole("ADMIN");

  const parsed = assignIssueSchema.safeParse({ assigneeId: formData.get("assigneeId") ?? "" });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid assignee." };
  }

  const issue = await requireExistingIssue(issueId);
  const newAssigneeId = parsed.data.assigneeId || null;

  const [previousAssignee, newAssignee] = await Promise.all([
    issue.assigneeId ? prisma.user.findUnique({ where: { id: issue.assigneeId }, select: { name: true } }) : null,
    newAssigneeId ? prisma.user.findUnique({ where: { id: newAssigneeId }, select: { name: true } }) : null,
  ]);
  if (newAssigneeId && !newAssignee) {
    return { error: "Selected user does not exist." };
  }

  await prisma.$transaction([
    prisma.issue.update({ where: { id: issueId }, data: { assigneeId: newAssigneeId } }),
    prisma.auditLog.create({
      data: {
        issueId,
        actorId: admin.id,
        action: newAssignee
          ? `Assigned issue to ${newAssignee.name} (previously ${previousAssignee?.name ?? "unassigned"}).`
          : `Unassigned issue (previously ${previousAssignee?.name ?? "unassigned"}).`,
      },
    }),
  ]);

  revalidatePath(`/dashboard/issues/${issueId}`);
  revalidatePath("/dashboard");
  return { error: null };
}

export async function overrideTriageAction(
  issueId: string,
  _prevState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  const admin = await requireRole("ADMIN");

  const parsed = overrideTriageSchema.safeParse({
    category: formData.get("category"),
    priority: formData.get("priority"),
    rootCause: formData.get("rootCause"),
    suggestedStep: formData.get("suggestedStep"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const issue = await requireExistingIssue(issueId);

  await prisma.$transaction([
    prisma.issue.update({
      where: { id: issueId },
      data: {
        aiCategory: parsed.data.category,
        aiPriority: parsed.data.priority,
        aiRootCause: parsed.data.rootCause,
        aiSuggestedStep: parsed.data.suggestedStep,
        triageStatus: "DONE",
        priorityOverridden: true,
      },
    }),
    prisma.auditLog.create({
      data: {
        issueId,
        actorId: admin.id,
        action: `Overrode AI triage (was category=${issue.aiCategory ?? "none"}, priority=${issue.aiPriority ?? "none"}, triageStatus=${issue.triageStatus}).`,
      },
    }),
  ]);

  revalidatePath(`/dashboard/issues/${issueId}`);
  revalidatePath("/dashboard");
  return { error: null };
}

export async function deleteIssueAction(issueId: string): Promise<void> {
  await requireRole("ADMIN");
  await requireExistingIssue(issueId);

  // Deleting the issue cascades its comments and audit logs (see
  // prisma/schema.prisma onDelete: Cascade) — there is no separate audit
  // entry for the deletion itself since it would be destroyed immediately
  // after being written.
  await prisma.issue.delete({ where: { id: issueId } });

  revalidatePath("/dashboard");
}

"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { updateStatusSchema, assignIssueSchema, overrideTriageSchema } from "@/lib/validations/admin";
import type { IssueFormState } from "./actions";

const ISSUE_NOT_FOUND_ERROR: IssueFormState = { error: "Issue not found." };

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

  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) return ISSUE_NOT_FOUND_ERROR;

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

  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) return ISSUE_NOT_FOUND_ERROR;

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

  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) return ISSUE_NOT_FOUND_ERROR;

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

  // Idempotent: if it's already gone (e.g. another admin deleted it first),
  // there's nothing left to do — no need to surface an error for a harmless
  // race condition.
  await prisma.issue.deleteMany({ where: { id: issueId } });

  revalidatePath("/dashboard");
}

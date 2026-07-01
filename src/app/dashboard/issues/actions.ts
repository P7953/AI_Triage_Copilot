"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { createIssueSchema, updateIssueSchema, createCommentSchema } from "@/lib/validations/issue";
import { triageIssue } from "@/lib/ai/triage";

export type IssueFormState = {
  error: string | null;
};

export async function createIssueAction(
  _prevState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  const user = await requireUser();

  const parsed = createIssueSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const issue = await prisma.issue.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      reporterId: user.id,
    },
  });

  await triageIssue(issue.id);

  revalidatePath("/dashboard");
  redirect(`/dashboard/issues/${issue.id}`);
}

export async function updateIssueAction(
  issueId: string,
  _prevState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  const user = await requireUser();

  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) {
    return { error: "Issue not found." };
  }
  // Real authorization check: only the reporter may edit, and only while
  // OPEN — never trust that the UI only shows this form to the right user.
  if (issue.reporterId !== user.id || issue.status !== "OPEN") {
    return { error: "You can only edit your own issues while they're still open." };
  }

  const parsed = updateIssueSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.issue.update({
    where: { id: issueId },
    data: { title: parsed.data.title, description: parsed.data.description },
  });

  revalidatePath(`/dashboard/issues/${issueId}`);
  revalidatePath("/dashboard");
  return { error: null };
}

export async function addCommentAction(
  issueId: string,
  _prevState: IssueFormState,
  formData: FormData,
): Promise<IssueFormState> {
  const user = await requireUser();

  const issue = await prisma.issue.findUnique({ where: { id: issueId }, select: { id: true } });
  if (!issue) {
    return { error: "Issue not found." };
  }

  const parsed = createCommentSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await prisma.comment.create({
    data: { issueId, authorId: user.id, body: parsed.data.body },
  });

  revalidatePath(`/dashboard/issues/${issueId}`);
  return { error: null };
}

"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import type { Category, Priority, Status } from "@/generated/prisma/enums";
import { updateStatusAction, assignIssueAction, overrideTriageAction, deleteIssueAction } from "../admin-actions";
import type { IssueFormState } from "../actions";

const initialState: IssueFormState = { error: null };

const STATUS_OPTIONS: Status[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const CATEGORY_OPTIONS: Category[] = ["BUG", "FEATURE", "QUESTION", "PERFORMANCE", "SECURITY", "OTHER"];
const PRIORITY_OPTIONS: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function StatusForm({ issueId, currentStatus }: { issueId: string; currentStatus: Status }) {
  const boundAction = updateStatusAction.bind(null, issueId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={currentStatus}>
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Saving..." : "Update status"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}

export function AssignForm({
  issueId,
  currentAssigneeId,
  users,
}: {
  issueId: string;
  currentAssigneeId: string | null;
  users: { id: string; name: string; role: string }[];
}) {
  const boundAction = assignIssueAction.bind(null, issueId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="assigneeId">Assignee</Label>
        <Select name="assigneeId" defaultValue={currentAssigneeId ?? ""}>
          <SelectTrigger id="assigneeId">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Unassigned</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name} ({user.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending} size="sm">
        {pending ? "Saving..." : "Assign"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}

export function OverrideTriageForm({
  issueId,
  defaultCategory,
  defaultPriority,
  defaultRootCause,
  defaultSuggestedStep,
}: {
  issueId: string;
  defaultCategory: Category | null;
  defaultPriority: Priority | null;
  defaultRootCause: string | null;
  defaultSuggestedStep: string | null;
}) {
  const boundAction = overrideTriageAction.bind(null, issueId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border p-3">
      <p className="text-sm font-medium">Override AI triage</p>
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" defaultValue={defaultCategory ?? undefined}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="priority">Priority</Label>
          <Select name="priority" defaultValue={defaultPriority ?? undefined}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="rootCause">Root cause hypothesis</Label>
        <Textarea id="rootCause" name="rootCause" defaultValue={defaultRootCause ?? ""} rows={2} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="suggestedStep">Suggested first step</Label>
        <Textarea
          id="suggestedStep"
          name="suggestedStep"
          defaultValue={defaultSuggestedStep ?? ""}
          rows={2}
          required
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} size="sm" className="self-start">
        {pending ? "Saving..." : "Save override"}
      </Button>
    </form>
  );
}

export function DeleteIssueButton({ issueId }: { issueId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    await deleteIssueAction(issueId);
    // A full navigation (not router.push) guarantees /dashboard is fetched
    // fresh — the client router cache can otherwise serve a stale payload
    // after a direct (non-form) action call like this one.
    window.location.assign("/dashboard");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>Delete issue</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this issue?</DialogTitle>
          <DialogDescription>
            This permanently deletes the issue, its comments, and its audit log. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="destructive" disabled={pending} onClick={handleDelete}>
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

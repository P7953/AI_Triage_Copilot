"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, AlertTriangle } from "lucide-react";
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
    <form action={formAction} className="flex flex-col gap-1.5 min-w-[150px]">
      <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Status
      </Label>
      <div className="flex items-center gap-2">
        <Select name="status" defaultValue={currentStatus}>
          <SelectTrigger id="status" className="h-9 px-3 min-w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={pending} size="sm" className="h-9 px-3">
          {pending ? "Saving..." : "Update"}
        </Button>
      </div>
      {state.error && <p className="text-xs text-destructive mt-1">{state.error}</p>}
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
    <form action={formAction} className="flex flex-col gap-1.5 min-w-[200px]">
      <Label htmlFor="assigneeId" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Assignee
      </Label>
      <div className="flex items-center gap-2">
        <Select name="assigneeId" defaultValue={currentAssigneeId ?? ""}>
          <SelectTrigger id="assigneeId" className="h-9 px-3 min-w-[160px]">
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
        <Button type="submit" disabled={pending} size="sm" className="h-9 px-3">
          {pending ? "Saving..." : "Assign"}
        </Button>
      </div>
      {state.error && <p className="text-xs text-destructive mt-1">{state.error}</p>}
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
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-border/80 bg-muted/20 p-4">
      <div className="flex items-center justify-between border-b pb-2 border-border/60">
        <p className="text-xs font-bold uppercase tracking-wider text-foreground">Override AI triage details</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Category
          </Label>
          <Select name="category" defaultValue={defaultCategory ?? undefined}>
            <SelectTrigger id="category" className="h-9 px-3 w-full">
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="priority" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Priority
          </Label>
          <Select name="priority" defaultValue={defaultPriority ?? undefined}>
            <SelectTrigger id="priority" className="h-9 px-3 w-full">
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rootCause" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Root cause hypothesis
        </Label>
        <Textarea 
          id="rootCause" 
          name="rootCause" 
          defaultValue={defaultRootCause ?? ""} 
          rows={3} 
          placeholder="Detailed root cause hypothesis..."
          required 
          className="resize-y p-3 focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="suggestedStep" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Suggested first step
        </Label>
        <Textarea
          id="suggestedStep"
          name="suggestedStep"
          defaultValue={defaultSuggestedStep ?? ""}
          rows={3}
          placeholder="Recommended action items for the assignee..."
          required
          className="resize-y p-3 focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </div>

      {state.error && <p className="text-xs text-destructive">{state.error}</p>}
      
      <Button type="submit" disabled={pending} size="sm" className="h-9 px-4 self-start font-semibold mt-1">
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
    window.location.assign("/dashboard");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" size="sm" className="h-9 px-3 gap-1.5" />}>
        <Trash2 className="size-4" />
        <span>Delete issue</span>
      </DialogTrigger>
      <DialogContent className="max-w-[420px] rounded-2xl p-6 border border-border bg-card shadow-2xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150">
        <DialogHeader className="flex flex-col gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-1 self-start">
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">Delete this issue?</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            This permanently deletes the issue, its comments, and its audit log. This action cannot be undone and will be permanently logged.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex items-center gap-3 justify-end mt-6">
          <DialogClose render={<Button variant="outline" className="h-9 px-4" />}>Cancel</DialogClose>
          <Button variant="destructive" disabled={pending} onClick={handleDelete} className="h-9 px-4 font-semibold">
            {pending ? "Deleting..." : "Delete Issue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

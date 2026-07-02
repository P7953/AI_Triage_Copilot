"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit3 } from "lucide-react";
import { updateIssueAction, type IssueFormState } from "../actions";

const initialState: IssueFormState = { error: null };

export function EditIssueForm({
  issueId,
  defaultTitle,
  defaultDescription,
}: {
  issueId: string;
  defaultTitle: string;
  defaultDescription: string;
}) {
  const boundAction = updateIssueAction.bind(null, issueId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b pb-2 border-border/60">
        <Edit3 className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Edit issue details</h2>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Issue Title
        </Label>
        <Input 
          id="title" 
          name="title" 
          defaultValue={defaultTitle} 
          required 
          minLength={5} 
          maxLength={150} 
          className="h-10 px-3"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Detailed Description
        </Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultDescription}
          required
          minLength={20}
          maxLength={5000}
          rows={6}
          className="p-3 resize-y focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </div>

      {state.error && (
        <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {state.error}
        </div>
      )}
      
      <Button type="submit" disabled={pending} className="h-9 px-4 self-start font-semibold shadow-sm mt-1">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}

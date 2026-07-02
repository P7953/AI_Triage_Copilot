"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { addCommentAction, type IssueFormState } from "../actions";

const initialState: IssueFormState = { error: null };

export function CommentForm({ issueId }: { issueId: string }) {
  const boundAction = addCommentAction.bind(null, issueId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Label htmlFor="body" className="sr-only">
        Add a comment
      </Label>
      <Textarea 
        id="body" 
        name="body" 
        required 
        maxLength={2000} 
        rows={3} 
        placeholder="Post a reply or update..." 
        className="p-3 focus-visible:ring-2 focus-visible:ring-primary/20"
      />
      {state.error && (
        <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {state.error}
        </div>
      )}
      <Button type="submit" disabled={pending} className="h-9 px-4 self-start font-semibold gap-1.5 shadow-sm">
        <Send className="size-3.5" />
        <span>{pending ? "Posting..." : "Reply"}</span>
      </Button>
    </form>
  );
}

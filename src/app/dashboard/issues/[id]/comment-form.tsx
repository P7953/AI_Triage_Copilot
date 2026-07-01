"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { addCommentAction, type IssueFormState } from "../actions";

const initialState: IssueFormState = { error: null };

export function CommentForm({ issueId }: { issueId: string }) {
  const boundAction = addCommentAction.bind(null, issueId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Label htmlFor="body" className="sr-only">
        Add a comment
      </Label>
      <Textarea id="body" name="body" required maxLength={2000} rows={3} placeholder="Add a comment..." />
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Posting..." : "Post comment"}
      </Button>
    </form>
  );
}

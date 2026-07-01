"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border p-4">
      <h2 className="font-medium">Edit issue</h2>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={defaultTitle} required minLength={5} maxLength={150} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultDescription}
          required
          minLength={20}
          maxLength={5000}
          rows={6}
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}

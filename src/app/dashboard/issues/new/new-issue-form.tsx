"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { createIssueAction, type IssueFormState } from "../actions";

const initialState: IssueFormState = { error: null };

export function NewIssueForm() {
  const [state, formAction, pending] = useActionState(createIssueAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Issue Title
        </Label>
        <Input 
          id="title" 
          name="title" 
          required 
          minLength={5} 
          maxLength={150} 
          placeholder="e.g., UI not responsive in mobile viewport"
          className="h-10 px-3"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Issue Description
        </Label>
        <Textarea
          id="description"
          name="description"
          required
          minLength={20}
          maxLength={5000}
          rows={8}
          placeholder="What happened? Steps to reproduce, expected vs. actual behavior, error messages, environment context, etc."
          className="p-3 resize-y focus-visible:ring-2 focus-visible:ring-primary/20"
        />
      </div>
      
      {state.error && (
        <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          {state.error}
        </div>
      )}

      <Button type="submit" disabled={pending} className="h-10 px-5 font-semibold gap-1.5 shadow-md shadow-primary/10 self-start mt-2">
        <Sparkles className="size-4" />
        <span>{pending ? "Analyzing & Submitting..." : "Submit issue"}</span>
      </Button>
    </form>
  );
}

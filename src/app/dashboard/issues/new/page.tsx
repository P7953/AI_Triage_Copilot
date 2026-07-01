import { NewIssueForm } from "./new-issue-form";

export default function NewIssuePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New issue</h1>
      <NewIssueForm />
    </div>
  );
}

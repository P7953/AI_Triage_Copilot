import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function IssueNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Issue not found</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        This issue may have been deleted, or the link is incorrect.
      </p>
      <Button nativeButton={false} render={<Link href="/dashboard" />}>
        Back to issues
      </Button>
    </div>
  );
}

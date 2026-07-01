import { Skeleton } from "@/components/ui/skeleton";

export default function IssueDetailLoading() {
  return (
    <div className="flex max-w-2xl flex-col gap-6" role="status" aria-label="Loading issue">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-16 w-full" />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}

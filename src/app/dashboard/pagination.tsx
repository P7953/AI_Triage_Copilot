import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefForPage(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(targetPage));
    return `/dashboard?${params.toString()}`;
  }

  return (
    <nav aria-label="Issue list pagination" className="flex items-center justify-between gap-4">
      <Button
        nativeButton={false}
        variant="outline"
        size="sm"
        disabled={page <= 1}
        render={page > 1 ? <Link href={hrefForPage(page - 1)} /> : <span aria-disabled="true" />}
      >
        Previous
      </Button>
      <p className="text-muted-foreground text-sm" aria-live="polite">
        Page {page} of {totalPages}
      </p>
      <Button
        nativeButton={false}
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        render={page < totalPages ? <Link href={hrefForPage(page + 1)} /> : <span aria-disabled="true" />}
      >
        Next
      </Button>
    </nav>
  );
}

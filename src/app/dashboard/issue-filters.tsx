"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, Priority, Status } from "@/generated/prisma/enums";

const STATUS_OPTIONS: Status[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const CATEGORY_OPTIONS: Category[] = ["BUG", "FEATURE", "QUESTION", "PERFORMANCE", "SECURITY", "OTHER"];
const PRIORITY_OPTIONS: Priority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "priority", label: "Priority (high to low)" },
  { value: "confidence", label: "Confidence (low to high)" },
];

export function IssueFilters({
  status,
  category,
  priority,
  sort,
}: {
  status?: string;
  category?: string;
  priority?: string;
  sort?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Any filter/sort change resets pagination back to page 1.
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasActiveFilters = Boolean(status || category || priority);

  return (
    <div className="flex flex-wrap items-end gap-4" role="search" aria-label="Filter and sort issues">
      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-status">Status</Label>
        <Select value={status ?? ""} onValueChange={(value) => updateParam("status", value)}>
          <SelectTrigger id="filter-status">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any status</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-category">Category</Label>
        <Select value={category ?? ""} onValueChange={(value) => updateParam("category", value)}>
          <SelectTrigger id="filter-category">
            <SelectValue placeholder="Any category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any category</SelectItem>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-priority">Priority</Label>
        <Select value={priority ?? ""} onValueChange={(value) => updateParam("priority", value)}>
          <SelectTrigger id="filter-priority">
            <SelectValue placeholder="Any priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any priority</SelectItem>
            {PRIORITY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="filter-sort">Sort by</Label>
        <Select value={sort ?? "newest"} onValueChange={(value) => updateParam("sort", value)}>
          <SelectTrigger id="filter-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname)}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}

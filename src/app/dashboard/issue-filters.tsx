"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
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
    <div 
      className="flex flex-wrap items-end gap-5 rounded-xl border border-border/80 bg-card/60 p-4 shadow-sm backdrop-blur-sm" 
      role="search" 
      aria-label="Filter and sort issues"
    >
      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <Label htmlFor="filter-status" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Status
        </Label>
        <Select value={status ?? ""} onValueChange={(value) => updateParam("status", value)}>
          <SelectTrigger id="filter-status" className="w-full h-9 px-3">
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any status</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <Label htmlFor="filter-category" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Category
        </Label>
        <Select value={category ?? ""} onValueChange={(value) => updateParam("category", value)}>
          <SelectTrigger id="filter-category" className="w-full h-9 px-3">
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

      <div className="flex flex-col gap-1.5 min-w-[140px]">
        <Label htmlFor="filter-priority" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Priority
        </Label>
        <Select value={priority ?? ""} onValueChange={(value) => updateParam("priority", value)}>
          <SelectTrigger id="filter-priority" className="w-full h-9 px-3">
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

      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <Label htmlFor="filter-sort" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Sort by
        </Label>
        <Select value={sort ?? "newest"} onValueChange={(value) => updateParam("sort", value)}>
          <SelectTrigger id="filter-sort" className="w-full h-9 px-3">
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
          variant="outline"
          size="sm"
          onClick={() => router.push(pathname)}
          className="h-9 gap-1 text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="size-3.5" />
          <span>Clear filters</span>
        </Button>
      )}
    </div>
  );
}

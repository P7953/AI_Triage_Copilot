import { Badge } from "@/components/ui/badge";
import type { Category, Priority, Status } from "@/generated/prisma/enums";

const STATUS_LABELS: Record<Status, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export function StatusBadge({ status }: { status: Status }) {
  const variant = status === "CLOSED" ? "outline" : status === "OPEN" ? "secondary" : "default";
  return <Badge variant={variant}>{STATUS_LABELS[status]}</Badge>;
}

const CATEGORY_LABELS: Record<Category, string> = {
  BUG: "Bug",
  FEATURE: "Feature",
  QUESTION: "Question",
  PERFORMANCE: "Performance",
  SECURITY: "Security",
  OTHER: "Other",
};

export function CategoryBadge({ category }: { category: Category }) {
  return <Badge variant="outline">{CATEGORY_LABELS[category]}</Badge>;
}

const PRIORITY_STYLES: Record<Priority, string> = {
  // bg-muted + text-muted-foreground measured at 4.34:1 (axe-core),
  // just under the 4.5:1 WCAG AA threshold — text-foreground fixes it.
  LOW: "bg-muted text-foreground",
  MEDIUM: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  HIGH: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={PRIORITY_STYLES[priority]}>{priority}</Badge>;
}

const LOW_CONFIDENCE_THRESHOLD = 0.5;

// The shadcn "destructive" badge variant (bg-destructive/10 + text-destructive)
// fails WCAG AA contrast — same hue for both foreground and background,
// differing only by opacity. Use a solid light-bg/dark-text pairing instead,
// verified with axe-core.
const HIGH_CONTRAST_DESTRUCTIVE = "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const isLow = confidence < LOW_CONFIDENCE_THRESHOLD;
  return (
    <Badge
      variant="outline"
      className={isLow ? HIGH_CONTRAST_DESTRUCTIVE : undefined}
      title={isLow ? "Low confidence — review recommended" : undefined}
    >
      {Math.round(confidence * 100)}% confidence{isLow ? " ⚠" : ""}
    </Badge>
  );
}

export function TriagePendingBadge() {
  return <Badge variant="secondary">Awaiting triage</Badge>;
}

export function TriageFailedBadge() {
  return <Badge className={HIGH_CONTRAST_DESTRUCTIVE}>Triage failed — needs manual review</Badge>;
}

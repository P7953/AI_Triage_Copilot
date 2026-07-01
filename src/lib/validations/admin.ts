import { z } from "zod";
import { Status, Category, Priority } from "@/generated/prisma/enums";

export const updateStatusSchema = z.object({
  status: z.enum(Status),
});

export const assignIssueSchema = z.object({
  // Empty string means "unassign".
  assigneeId: z.union([z.string().min(1), z.literal("")]),
});

export const overrideTriageSchema = z.object({
  category: z.enum(Category),
  priority: z.enum(Priority),
  rootCause: z.string().trim().min(1, "Root cause is required").max(2000),
  suggestedStep: z.string().trim().min(1, "Suggested first step is required").max(2000),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type AssignIssueInput = z.infer<typeof assignIssueSchema>;
export type OverrideTriageInput = z.infer<typeof overrideTriageSchema>;

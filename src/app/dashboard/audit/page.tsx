import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AuditLogPage() {
  const session = await getSession();
  // Real check: this page is only reachable with an ADMIN session, re-verified
  // server-side on every request — not just hidden from the nav for members.
  if (session?.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      actor: { select: { name: true } },
      issue: { select: { id: true, title: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Audit log</h1>
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">No admin actions have been logged yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-lg border p-3 text-sm">
              <p>
                <span className="font-medium">{entry.actor.name}</span> — {entry.action}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                <Link href={`/dashboard/issues/${entry.issue.id}`} className="underline underline-offset-4">
                  {entry.issue.title}
                </Link>{" "}
                · {entry.createdAt.toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

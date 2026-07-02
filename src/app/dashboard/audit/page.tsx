import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { History, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function AuditLogPage() {
  const session = await getSession();
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
    <div className="flex flex-col gap-8">
      {/* Title Header */}
      <div className="flex flex-col gap-1 border-b border-border/60 pb-4">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight flex items-center gap-2">
          <History className="size-7 text-primary" />
          <span>Audit Log</span>
        </h1>
        <p className="text-sm text-muted-foreground">Track all administrative overrides, assignments, and status changes across the project.</p>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/120 p-12 text-center bg-card/10 backdrop-blur-sm">
          <ShieldCheck className="size-10 text-muted-foreground mb-4" />
          <p className="font-semibold text-foreground">No admin actions logged</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Administrative actions, overrides, and status updates will be logged here in real-time.
          </p>
        </div>
      ) : (
        <div className="relative border-l-2 border-border/80 pl-6 ml-4 flex flex-col gap-6 py-2">
          {entries.map((entry) => {
            const initials = entry.actor.name
              ? entry.actor.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
              : "??";

            return (
              <div key={entry.id} className="relative group">
                {/* Timeline node */}
                <span className="absolute -left-[33px] top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background shadow-sm">
                  <span className="size-1.5 rounded-full bg-background" />
                </span>

                <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-card p-4 shadow-sm transition-all hover:shadow-md max-w-2xl">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm" className="size-6">
                      <AvatarFallback className="bg-primary/10 text-[9px] font-bold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-wrap items-baseline gap-1.5 text-xs text-muted-foreground">
                      <strong className="text-foreground font-semibold">{entry.actor.name}</strong>
                      <span>performed action:</span>
                    </div>
                  </div>

                  <p className="text-sm text-foreground/95 font-medium leading-relaxed mt-1">
                    {entry.action}
                  </p>

                  <div className="flex items-center justify-between border-t border-border/60 pt-3 mt-1 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <FileText className="size-3.5" />
                      <span>Issue: </span>
                      <Link 
                        href={`/dashboard/issues/${entry.issue.id}`} 
                        className="font-medium text-primary hover:underline underline-offset-4 flex items-center gap-0.5"
                      >
                        {entry.issue.title}
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                    
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

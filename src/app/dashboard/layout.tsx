import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { signOutAction } from "./actions";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4">
        <nav aria-label="Main" className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold">
            AI Triage Copilot
          </Link>
          {session.user.role === "ADMIN" && (
            <Link href="/dashboard/audit" className="text-muted-foreground text-sm hover:text-foreground">
              Audit log
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            {session.user.email} · {session.user.role}
          </span>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main id="main-content" className="flex flex-1 flex-col gap-6 p-6">
        {children}
      </main>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { signOutAction } from "./actions";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShieldAlert, LogOut, FileText, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (session.user.email?.[0] || "?").toUpperCase();

  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/80 px-6 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <nav aria-label="Main" className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight text-foreground">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <ShieldAlert className="size-4.5" />
              </div>
              <span className="hidden sm:inline">AI Triage Copilot</span>
            </Link>
            
            <div className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-foreground/80 hover:bg-accent/80 hover:text-foreground transition-all"
              >
                <LayoutDashboard className="size-4 text-muted-foreground" />
                <span>Issues</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/dashboard/audit"
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-foreground/80 hover:bg-accent/80 hover:text-foreground transition-all"
                >
                  <FileText className="size-4 text-muted-foreground" />
                  <span>Audit log</span>
                </Link>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Divider */}
            <span className="h-6 w-px bg-border/60 hidden sm:inline" />

            {/* User Profile Card */}
            <div className="flex items-center gap-3">
              <Avatar size="default" className="shadow-sm">
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="hidden flex-col text-left sm:flex">
                <span className="text-xs font-semibold leading-none text-foreground max-w-[140px] truncate">
                  {session.user.name || session.user.email}
                </span>
                <span className="mt-0.5 inline-flex w-fit items-center rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                  {session.user.role}
                </span>
              </div>

              <form action={signOutAction} className="ml-1">
                <Button type="submit" variant="ghost" size="icon-sm" title="Sign out" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <LogOut className="size-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}

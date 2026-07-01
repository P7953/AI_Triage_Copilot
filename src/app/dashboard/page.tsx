import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { signOutAction } from "./actions";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-svh flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>
        Signed in as <strong>{session.user.email}</strong> ({session.user.role})
      </p>
      <p className="text-muted-foreground text-sm">
        Issue triage queue lands in Phase 4.
      </p>
      <form action={signOutAction}>
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </main>
  );
}

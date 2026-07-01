import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="max-w-xl text-4xl font-semibold tracking-tight">AI Triage Copilot</h1>
      <p className="max-w-md text-muted-foreground">
        Submit issues, get an AI-assisted first triage pass, and let admins review and
        override before anything ships.
      </p>
      <div className="flex gap-4">
        <Button nativeButton={false} render={<Link href="/login" />}>
          Sign in
        </Button>
        <Button nativeButton={false} variant="outline" render={<Link href="/register" />}>
          Register
        </Button>
      </div>
    </main>
  );
}

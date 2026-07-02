import Link from "next/link";
import { RegisterForm } from "./register-form";
import { ShieldAlert } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-12">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 bg-radial-[circle_600px_at_50%_-100px] from-primary/15 via-transparent to-transparent opacity-70" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 dark:opacity-10" />

      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          href="/"
          className="mx-auto flex items-center gap-2 font-heading text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <ShieldAlert className="size-4" />
          </div>
          AI Triage Copilot
        </Link>

        <div className="rounded-2xl border border-border/80 bg-card/65 p-8 shadow-xl backdrop-blur-md">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              Sign up to report issues and collaborate with team admins
            </p>
          </div>

          <div className="mt-6">
            <RegisterForm />
          </div>
        </div>
      </div>
    </main>
  );
}

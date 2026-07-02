import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, ShieldCheck, PlusCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-12 md:py-24">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 bg-radial-[circle_800px_at_100%_200px] from-primary/10 via-transparent to-transparent opacity-60 dark:opacity-40" />
      <div className="absolute inset-0 -z-10 bg-radial-[circle_600px_at_0%_80%] from-accent/20 via-transparent to-transparent opacity-40" />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 dark:opacity-15" />

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        {/* Release Tag */}
        <div className="animate-fade-in inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <span className="flex size-1.5 rounded-full bg-primary animate-pulse" />
          AI-Assisted Issue Management
        </div>

        {/* Hero Title */}
        <h1 className="mt-6 max-w-2xl font-heading text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          AI Triage <span className="bg-gradient-to-r from-primary to-ring bg-clip-text text-transparent">Copilot</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl leading-relaxed">
          Submit issues, get an AI-assisted first triage pass instantly, and let admins review and
          override decisions before code ships.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            nativeButton={false}
            size="lg"
            render={<Link href="/login" />}
            className="shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
          >
            Sign in <ArrowRight className="ml-1 size-4" />
          </Button>
          <Button
            nativeButton={false}
            variant="outline"
            size="lg"
            render={<Link href="/register" />}
            className="transition-transform hover:-translate-y-0.5"
          >
            Register
          </Button>
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid w-full grid-cols-1 gap-6 sm:grid-cols-3 text-left">
          {/* Card 1 */}
          <div className="group relative rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PlusCircle className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">1. Report Issues</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Members easily submit detailed tickets about bugs, security threats, performance issues, or feature requests.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group relative rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BrainCircuit className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">2. AI Auto-Triage</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Instant classification. The AI predicts the category, severity, root cause hypothesis, and suggested first action.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group relative rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="mt-4 font-semibold text-foreground">3. Admin Oversight</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Human-in-the-loop controls. Admins hold final authority to override AI triage, assign members, and resolve tasks.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

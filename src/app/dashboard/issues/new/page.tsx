import Link from "next/link";
import { NewIssueForm } from "./new-issue-form";
import { ArrowLeft, BrainCircuit, Sparkles, ShieldAlert, Cpu } from "lucide-react";

export default function NewIssuePage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Back navigation */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to dashboard</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-2 rounded-2xl border border-border/80 bg-card p-6 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-1 border-b border-border/60 pb-4">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Report a new issue</h1>
            <p className="text-sm text-muted-foreground">Describe the issue in detail. The AI Copilot will triage it immediately.</p>
          </div>
          <NewIssueForm />
        </div>

        {/* Right Column: AI Triage Guide */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 via-transparent to-transparent p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-primary/10 pb-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Cpu className="size-4" />
              </div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">AI Auto-Triage Process</h2>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Our Vercel AI SDK-powered copilot uses advanced natural language understanding to process issue reports the moment they are created.
            </p>

            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</span>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Instant Categorization</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Categorizes the issue as Bug, Feature, Question, Performance, or Security threat.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">2</span>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">Priority Assignment</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Calculates issue priority (Low, Medium, High, or Critical) along with a confidence metric.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">3</span>
                <div>
                  <h4 className="text-xs font-semibold text-foreground">First-Step Hypothesis</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Hypothesizes the root cause and suggests the immediate next step for the developer.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-xl bg-muted/30 border border-border/50 p-3">
              <ShieldAlert className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <strong>Human-in-the-loop:</strong> AI decisions are assistive. Administrators review all classifications and can override any details as needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

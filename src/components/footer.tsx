import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-card/30 px-6 py-6 text-center text-xs text-muted-foreground backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="flex items-center gap-1">
          Built by{" "}
          <span className="font-semibold text-foreground">Prathmesh Sunil Kadam</span>
        </p>
        <div className="flex gap-4">
          <a
            href="https://github.com/P7953"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            GitHub Profile
          </a>
          <span className="text-border">·</span>
          <a
            href="https://www.linkedin.com/in/prathmeshskadam7953"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            LinkedIn Profile
          </a>
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  return (
    <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
      <p>
        Built by{" "}
        {/* TODO(you): replace these three placeholders before shipping/submitting. */}
        <span>[Your Name]</span> ·{" "}
        <a href="https://github.com/[your-username]" className="underline underline-offset-4 hover:text-foreground">
          GitHub
        </a>{" "}
        ·{" "}
        <a
          href="https://www.linkedin.com/in/[your-username]"
          className="underline underline-offset-4 hover:text-foreground"
        >
          LinkedIn
        </a>
      </p>
    </footer>
  );
}

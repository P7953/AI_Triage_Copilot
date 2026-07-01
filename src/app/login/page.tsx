import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Sign in to AI Triage Copilot</h1>
      <LoginForm />
    </main>
  );
}

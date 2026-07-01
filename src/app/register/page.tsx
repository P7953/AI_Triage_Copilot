import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <RegisterForm />
    </main>
  );
}

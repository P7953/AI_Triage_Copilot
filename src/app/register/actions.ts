"use server";

import bcrypt from "bcrypt";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { registerSchema } from "@/lib/validations/auth";

const PASSWORD_ROUNDS = 12;

export type RegisterFormState = {
  error: string | null;
};

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);

  try {
    // New accounts are always MEMBER; there is no client-controllable path
    // to ADMIN — that role is only ever set via the seed script or by an
    // admin acting directly on the database.
    await prisma.user.create({
      data: { name, email, passwordHash, role: "MEMBER" },
    });
  } catch (error) {
    // Race condition fallback: two concurrent registrations for the same
    // email past the findUnique check above. Same friendly message either way.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "An account with that email already exists." };
    }
    throw error;
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but automatic sign-in failed. Please log in." };
    }
    throw error;
  }

  return { error: null };
}

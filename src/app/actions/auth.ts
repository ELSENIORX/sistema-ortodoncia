"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { loginSchema, toFieldErrors } from "@/lib/schemas";
import { endSession, startSession } from "@/lib/session";
import type { ActionState } from "@/lib/action-state";

export async function loginAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { status: "error", errors: toFieldErrors(parsed.error) };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const passwordMatches =
    user && user.active ? await bcrypt.compare(parsed.data.password, user.passwordHash) : false;

  if (!user || !passwordMatches) {
    return { status: "error", message: "Correo o contraseña incorrectos." };
  }

  await startSession(user.id);
  redirect("/agenda");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/login");
}

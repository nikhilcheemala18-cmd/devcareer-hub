"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { loginInputSchema } from "@/lib/validation/auth";
import {
  authenticateAdmin,
  createSession,
  InvalidCredentialsError,
  AuthConfigurationError,
} from "@/lib/auth/auth";
import { isRateLimited } from "@/lib/auth/rateLimit";

export interface LoginState {
  error?: string;
}

async function getClientKey(): Promise<string> {
  const headerList = await headers();
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginInputSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const clientKey = await getClientKey();

  if (isRateLimited(clientKey)) {
    return { error: "Too many login attempts. Please try again in a few minutes." };
  }

  try {
    const user = await authenticateAdmin(parsed.data.email, parsed.data.password);
    await createSession(String(user._id), user.role);
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return { error: "Invalid email or password." };
    }
    if (error instanceof AuthConfigurationError) {
      console.error(error);
      return { error: "Login is not available right now. Please contact the site administrator." };
    }
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/admin");
}

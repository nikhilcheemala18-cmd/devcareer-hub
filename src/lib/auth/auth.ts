import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  AuthConfigurationError,
} from "@/lib/auth/session";

export { authenticateAdmin, InvalidCredentialsError } from "@/lib/auth/credentials";
export { AuthConfigurationError };

export interface CurrentUser {
  id: string;
  role: string;
}

export async function createSession(userId: string, role: string): Promise<void> {
  const token = createSessionToken({ sub: userId, role });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/** Reads and verifies the session cookie. Purely cryptographic — no database call. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  if (!session) {
    return null;
  }

  return { id: session.sub, role: session.role };
}

/** Redirects to /admin/login unless the current session belongs to an ADMIN. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return user;
}

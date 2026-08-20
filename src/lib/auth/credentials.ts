import "server-only";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

/**
 * Pure credential verification — no Next.js request-scoped APIs (cookies,
 * redirect). Kept separate from src/lib/auth/auth.ts so this logic can be
 * imported and tested outside a Next.js request (e.g. plain scripts),
 * unlike `next/headers`/`next/navigation`, which only work inside one.
 */

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password.");
    this.name = "InvalidCredentialsError";
  }
}

// Pre-computed hash of an arbitrary password, used to keep the bcrypt
// comparison cost constant whether or not the email exists — otherwise a
// "no such user" short-circuit responds measurably faster than a real
// password check and leaks account existence via timing.
const DUMMY_PASSWORD_HASH = "$2b$12$aWsGoYkNus3wDxEjX0za7.qET..okqIHe9HVMmxPGwGQMQQgS2HdO";

/**
 * Verifies email/password against the stored admin user. Always throws the
 * same InvalidCredentialsError for "no such user", "wrong password", and
 * "user is not ADMIN" so callers can't distinguish account existence from
 * the error alone.
 */
export async function authenticateAdmin(email: string, password: string) {
  await connectToDatabase();

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+passwordHash");

  if (!user) {
    await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches || user.role !== "ADMIN") {
    throw new InvalidCredentialsError();
  }

  return user;
}

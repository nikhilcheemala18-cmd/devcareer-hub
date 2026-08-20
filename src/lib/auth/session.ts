import crypto from "node:crypto";

/**
 * Deliberately NOT marked "server-only": this module is imported both by
 * server-side app code (Server Actions, Server Components) and by
 * `src/proxy.ts`, which runs in a separate, non-webpack-bundled context. The
 * "server-only" package throws unconditionally outside a context that sets
 * the "react-server" export condition, which proxy execution does not
 * reliably guarantee. Nothing in this file is safe to import from a Client
 * Component, but the guard has to be enforced by review rather than by the
 * package here.
 */

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  sub: string;
  role: string;
  exp: number;
}

export class AuthConfigurationError extends Error {
  constructor() {
    super("Authentication is not configured: missing AUTH_SECRET.");
    this.name = "AuthConfigurationError";
  }
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new AuthConfigurationError();
  }

  return secret;
}

function sign(payloadEncoded: string): string {
  return crypto.createHmac("sha256", getAuthSecret()).update(payloadEncoded).digest("base64url");
}

/** Creates a signed, stateless session token: base64url(payload) + "." + HMAC-SHA256 signature. */
export function createSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const full: SessionPayload = { ...payload, exp };
  const payloadEncoded = Buffer.from(JSON.stringify(full), "utf8").toString("base64url");
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

/**
 * Verifies a session token's signature and expiry. Returns null for any
 * invalid, tampered, expired, or malformed token — including when
 * AUTH_SECRET is unset, so a missing secret fails closed (nobody appears
 * authenticated) rather than crashing route protection.
 */
export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payloadEncoded, signature] = parts;

  let expectedSignature: string;
  try {
    expectedSignature = sign(payloadEncoded);
  } catch {
    return null;
  }

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadEncoded, "base64url").toString("utf8")) as Partial<SessionPayload>;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload as SessionPayload;
  } catch {
    return null;
  }
}

import "server-only";

import crypto from "node:crypto";

function b64url(input: Buffer | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, "utf-8");
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signInternalJwt(identity: { userId: string; firmId: string }, method: string, path: string): string | null {
  const secret = process.env.API_INTERNAL_JWT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    console.warn("API_INTERNAL_JWT_SECRET not set or too short; skipping server-to-server JWT signing");
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const ttl = Number(process.env.API_INTERNAL_JWT_TTL_SECONDS || "60");

  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sub: identity.userId,
    firm_id: identity.firmId,
    iat: now,
    exp: now + ttl,
    mth: method.toUpperCase(),
    pth: path,
  };

  const encodedHeader = b64url(JSON.stringify(header));
  const encodedPayload = b64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(signingInput)
    .digest();

  return `${signingInput}.${b64url(signature)}`;
}

export function withServerAuthHeaders(
  baseHeaders: HeadersInit | undefined,
  identity: { userId?: string | null; firmId?: string | null },
  method: string,
  path: string
): HeadersInit {
  const headers = new Headers(baseHeaders || {});

  if (identity.userId) {
    headers.set("X-User-Id", identity.userId);
  }
  if (identity.firmId) {
    headers.set("X-Firm-Id", identity.firmId);
  }

  // Bypass ngrok browser warning for automated fetch
  headers.set("ngrok-skip-browser-warning", "true");

  if (identity.userId && identity.firmId) {
    const token = signInternalJwt(
      { userId: identity.userId, firmId: identity.firmId },
      method,
      path
    );
    if (token) {
      headers.set("X-Internal-Auth", `Bearer ${token}`);
    }
  }

  return headers;
}


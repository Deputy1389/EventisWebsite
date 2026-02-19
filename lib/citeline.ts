const DEFAULT_API_URL = "http://localhost:8000";

export function getClientApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
}

export function getServerApiUrl(): string {
  const url = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
  console.log(`[getServerApiUrl] process.env.API_URL: ${process.env.API_URL}`);
  console.log(`[getServerApiUrl] process.env.NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
  console.log(`[getServerApiUrl] resolved URL: ${url}`);
  return url;
}

export function isHipaaEnforcementEnabled(): boolean {
  const raw =
    process.env.NEXT_PUBLIC_HIPAA_ENFORCEMENT ||
    process.env.HIPAA_ENFORCEMENT ||
    "false";
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

export function withTenantHeaders(
  baseHeaders: HeadersInit | undefined,
  identity: { userId?: string | null; firmId?: string | null }
): HeadersInit | undefined {
  if (!isHipaaEnforcementEnabled()) {
    return baseHeaders;
  }

  if (!identity.userId || !identity.firmId) {
    return baseHeaders;
  }

  const headers = new Headers(baseHeaders || {});
  headers.set("X-User-Id", identity.userId);
  headers.set("X-Firm-Id", identity.firmId);
  return headers;
}

const DEFAULT_MAX_PAGES = 2000;

export function buildWebsiteRunRequestPayload(rawPayload: string): string {
  const trimmed = String(rawPayload || "").trim();
  let parsed: Record<string, unknown> = {};

  if (trimmed) {
    const value = JSON.parse(trimmed) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Run request payload must be a JSON object");
    }
    parsed = { ...value as Record<string, unknown> };
  }

  if (parsed.max_pages == null) {
    parsed.max_pages = DEFAULT_MAX_PAGES;
  }

  return JSON.stringify(parsed);
}

export { DEFAULT_MAX_PAGES };

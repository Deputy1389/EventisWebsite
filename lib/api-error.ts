export function parseApiError(text: string): string {
  try {
    const data = JSON.parse(text);
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      if (typeof data.error === "string") return data.error;
      if (typeof data.detail === "string") return data.detail;
      if (typeof data.message === "string") return data.message;
    }
  } catch {
    // Not JSON, fall through to raw text
  }
  return text;
}

import { Session } from "next-auth";
import { getServerApiUrl } from "./citeline";

/**
 * Get firm ID from session or fetch from API if not present.
 * Handles demo accounts that don't have firmId in session.
 */
export async function getFirmId(session: Session | null): Promise<string | null> {
  if (!session?.user?.id) {
    return null;
  }

  // Return firmId from session if available
  if (session.user.firmId) {
    return session.user.firmId;
  }

  // Fetch from API if not in session
  try {
    const apiUrl = getServerApiUrl();
    const res = await fetch(`${apiUrl}/firms`, { cache: "no-store" });
    if (!res.ok) return null;

    const firms = await res.json();
    if (!firms || firms.length === 0) return null;

    return firms[0].id;
  } catch {
    return null;
  }
}

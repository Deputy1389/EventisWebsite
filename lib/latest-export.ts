export type LatestExportArtifact = {
  artifact_type: string;
};

export type LatestExport = {
  run_id: string;
  status: string;
  artifacts?: LatestExportArtifact[];
};

export const REVIEW_EXPORT_PREFERENCE = ["MEDIATION", "INTERNAL"] as const;

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export async function fetchLatestExportByModes(
  caseId: string,
  modes: readonly string[],
  fetchImpl: FetchLike = fetch,
): Promise<{ latestExport: LatestExport | null; mode: string | null }> {
  for (const rawMode of modes) {
    const mode = String(rawMode || "").trim().toUpperCase();
    const suffix = mode ? `?export_mode=${encodeURIComponent(mode)}` : "";
    const res = await fetchImpl(`/api/citeline/matters/${caseId}/exports/latest${suffix}`, {
      cache: "no-store",
    });
    if (res.ok) {
      return {
        latestExport: (await res.json()) as LatestExport,
        mode,
      };
    }
    if (res.status === 404) {
      continue;
    }
    throw new Error(`Failed to load latest export (HTTP ${res.status})`);
  }

  return {
    latestExport: null,
    mode: null,
  };
}

export async function fetchCanonicalLatestExport(
  caseId: string,
  fetchImpl: FetchLike = fetch,
): Promise<{ latestExport: LatestExport | null; mode: string | null }> {
  return fetchLatestExportByModes(caseId, REVIEW_EXPORT_PREFERENCE, fetchImpl);
}

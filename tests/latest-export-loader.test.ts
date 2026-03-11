import test from "node:test";
import assert from "node:assert/strict";

import { fetchCanonicalLatestExport, fetchLatestExportByModes } from "../lib/latest-export";

function makeResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("fresh matter with mediation latest export loads committed workspace source", async () => {
  const calls: string[] = [];
  const fetchImpl = async (input: string) => {
    calls.push(input);
    if (input.endsWith("?export_mode=MEDIATION")) {
      return makeResponse(200, { run_id: "run-med", status: "needs_review", artifacts: [{ artifact_type: "json" }] });
    }
    return makeResponse(404, { detail: "not found" });
  };

  const result = await fetchCanonicalLatestExport("matter-1", fetchImpl);
  assert.equal(result.mode, "MEDIATION");
  assert.equal(result.latestExport?.run_id, "run-med");
  assert.deepEqual(calls, ["/api/citeline/matters/matter-1/exports/latest?export_mode=MEDIATION"]);
});

test("loader falls back to internal when mediation latest export is absent", async () => {
  const calls: string[] = [];
  const fetchImpl = async (input: string) => {
    calls.push(input);
    if (input.endsWith("?export_mode=MEDIATION")) {
      return makeResponse(404, { detail: "not found" });
    }
    if (input.endsWith("?export_mode=INTERNAL")) {
      return makeResponse(200, { run_id: "run-int", status: "success", artifacts: [{ artifact_type: "json" }] });
    }
    return makeResponse(500, { detail: "unexpected" });
  };

  const result = await fetchCanonicalLatestExport("matter-2", fetchImpl);
  assert.equal(result.mode, "INTERNAL");
  assert.equal(result.latestExport?.run_id, "run-int");
  assert.deepEqual(calls, [
    "/api/citeline/matters/matter-2/exports/latest?export_mode=MEDIATION",
    "/api/citeline/matters/matter-2/exports/latest?export_mode=INTERNAL",
  ]);
});

test("empty state path only triggers when no committed latest export exists in any allowed mode", async () => {
  const result = await fetchLatestExportByModes(
    "matter-3",
    ["MEDIATION", "INTERNAL"],
    async () => makeResponse(404, { detail: "not found" }),
  );

  assert.equal(result.latestExport, null);
  assert.equal(result.mode, null);
});

test("loader does not swallow non-404 export errors behind empty state", async () => {
  await assert.rejects(
    fetchCanonicalLatestExport("matter-4", async () => makeResponse(500, { detail: "backend exploded" })),
    /Failed to load latest export \(HTTP 500\)/,
  );
});

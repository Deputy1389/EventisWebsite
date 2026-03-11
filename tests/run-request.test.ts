import test from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_MAX_PAGES, buildWebsiteRunRequestPayload } from "../lib/run-request";

test("blank run payload gets default max_pages", () => {
  const payload = JSON.parse(buildWebsiteRunRequestPayload(""));
  assert.equal(payload.max_pages, DEFAULT_MAX_PAGES);
});

test("explicit max_pages is preserved", () => {
  const payload = JSON.parse(buildWebsiteRunRequestPayload(JSON.stringify({ export_mode: "MEDIATION", max_pages: 1500 })));
  assert.equal(payload.max_pages, 1500);
  assert.equal(payload.export_mode, "MEDIATION");
});

test("non-object payload is rejected", () => {
  assert.throws(() => buildWebsiteRunRequestPayload("[]"), /JSON object/);
});

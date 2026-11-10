import assert from "node:assert/strict";
import test from "node:test";
import { isCslType } from "@red-cup-engineering/csl-json-services-section";

test("CSL-TYPES-QUICKSTART", () => {
  assert.equal(isCslType("article-journal"), true);
  assert.equal(isCslType("unknown-type"), false);
});

import assert from "node:assert/strict";
import test from "node:test";
import { isCslType } from "@red-cup-engineering/csl-json-services-section";
import { cslJsonSourceCodec } from "@red-cup-engineering/csl-json-services-section/source-codec";

test("CSL-TYPES-QUICKSTART", () => {
  assert.equal(isCslType("article-journal"), true);
  assert.equal(isCslType("unknown-type"), false);
});

test("CSL-JSON-SOURCE-QUICKSTART", () => {
  const items = [{ id: "study", type: "article-journal", title: "Field study",
    author: [{ literal: "Water Research Group" }], issued: { "date-parts": [[2026]] } }];
  const source = Buffer.from(JSON.stringify(items, null, 2));
  const reading = cslJsonSourceCodec.read(source);
  const written = cslJsonSourceCodec.write(items);
  assert.deepEqual(written.reading.value, reading.value);
  assert.equal(written.reading.claim.object, reading.claim.object);
  assert.notEqual(written.reading.source.ni, reading.source.ni);
  assert.throws(() => cslJsonSourceCodec.write([...items, ...items]), /duplicate CSL item id/u);
  assert.throws(() => cslJsonSourceCodec.read(Buffer.from('[{"id":"a","id":"b"}]')), /duplicate/u);
});

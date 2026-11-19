import { admitCanonicalJson, canonicalJson, JSON_RESOURCE_ENVELOPE } from "@red-cup-engineering/json-engine/canonical-json";
import { defineSourceCodec, encodeUtf8Source } from "@red-cup-engineering/typed-content/source-codec";
import { validateCslItem } from "./csl-json.mjs";

function validateItems(value) {
  if (!Array.isArray(value)) throw new TypeError("CSL-JSON bibliography requires an array of items");
  const ids = new Set();
  return value.map(item => {
    const validated = validateCslItem(item);
    if (ids.has(validated.id)) throw new TypeError(`duplicate CSL item id ${JSON.stringify(validated.id)}`);
    ids.add(validated.id);
    return validated;
  });
}

/** The house-admitted CSL-JSON item list carried in strict JSON. */
export const cslJsonSourceCodec = defineSourceCodec({
  id: "csl-json.admitted-items/v1",
  mediaType: "application/json",
  maxBytes: JSON_RESOURCE_ENVELOPE.maxSourceBytes,
  valueIdentity: "exact",
  decode: bytes => validateItems(admitCanonicalJson(bytes, JSON_RESOURCE_ENVELOPE).value),
  encode: value => encodeUtf8Source(canonicalJson(validateItems(value), JSON_RESOURCE_ENVELOPE)),
});

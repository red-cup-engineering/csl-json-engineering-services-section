import { admitCanonicalJson, canonicalJson, JSON_RESOURCE_ENVELOPE } from "@red-cup-engineering/json-engineering-services-section/canonical-json";
import { defineSourceCodec, encodeUtf8Source } from "@red-cup-engineering/signcell/source-codec";
import { admitCslItem } from "./csl-json.mjs";

function admitItems(value) {
  if (!Array.isArray(value)) throw new TypeError("CSL-JSON bibliography requires an array of items");
  const ids = new Set();
  return value.map(item => {
    const admitted = admitCslItem(item);
    if (ids.has(admitted.id)) throw new TypeError(`duplicate CSL item id ${JSON.stringify(admitted.id)}`);
    ids.add(admitted.id);
    return admitted;
  });
}

/** The house-admitted CSL-JSON item list carried in strict JSON. */
export const cslJsonSourceCodec = defineSourceCodec({
  id: "csl-json.admitted-items/v1",
  mediaType: "application/json",
  maxBytes: JSON_RESOURCE_ENVELOPE.maxSourceBytes,
  valueIdentity: "exact",
  decode: bytes => admitItems(admitCanonicalJson(bytes, JSON_RESOURCE_ENVELOPE).value),
  encode: value => encodeUtf8Source(canonicalJson(admitItems(value), JSON_RESOURCE_ENVELOPE)),
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { cslJsonSourceCodec } from '../src/source-codec.mjs';

test('published bibliography bytes retain their source and interpretation, and duplicate IDs refuse', () => {
  const guide = { id: 'guide', type: 'book', title: 'The Garden', author: [{ family: 'Birch' }], issued: { 'date-parts': [[2020]] } };
  const { bytes, reading } = cslJsonSourceCodec.write([guide]);
  assert.equal(new TextDecoder().decode(bytes), '[{"author":[{"family":"Birch"}],"id":"guide","issued":{"date-parts":[[2020]]},"title":"The Garden","type":"book"}]');
  assert.equal(reading.source.ni, 'ni:///sha-256;6gBRZE4BSO2vwvmY6uQFOrxBuhsIWdJIQidEU0OdshU');
  assert.equal(reading.claim.object, 'ni:///sha-256;coCHtl1bZUgairh0Hplhp2PBoma2ZCwtdNj2FE2YKOA');
  assert.deepEqual(cslJsonSourceCodec.read(bytes), reading);
  assert.throws(() => cslJsonSourceCodec.write([guide, guide]), /duplicate CSL item id/);
});

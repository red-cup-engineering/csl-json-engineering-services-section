import assert from 'node:assert/strict';
import test from 'node:test';
import { recognizeCslItem } from '@red-cup-engineering/csl-json-engineering-services-section';
import { cslJsonSourceCodec } from '@red-cup-engineering/csl-json-engineering-services-section/source-codec';

test('published bibliography bytes retain their source and interpretation, and duplicate IDs refuse', () => {
  const guide = { id: 'guide', type: 'book', title: 'The Garden', author: [{ family: 'Birch' }], issued: { 'date-parts': [[2020]] } };
  const { bytes, reading } = cslJsonSourceCodec.write([guide]);
  assert.equal(new TextDecoder().decode(bytes), '[{"author":[{"family":"Birch"}],"id":"guide","issued":{"date-parts":[[2020]]},"title":"The Garden","type":"book"}]');
  assert.equal(reading.source.ni, 'ni:///sha-256;6gBRZE4BSO2vwvmY6uQFOrxBuhsIWdJIQidEU0OdshU');
  assert.equal(reading.claim.object, 'ni:///sha-256;coCHtl1bZUgairh0Hplhp2PBoma2ZCwtdNj2FE2YKOA');
  assert.deepEqual(cslJsonSourceCodec.read(bytes), reading);
  assert.throws(() => cslJsonSourceCodec.write([guide, guide]), /duplicate CSL item id/);
  const duplicateKeys = new TextEncoder().encode('[{"id":"first","id":"second"}]');
  assert.throws(() => cslJsonSourceCodec.read(duplicateKeys), /duplicate|repeated/i);
});

test('citation lookup and formatting preserve numeric keys, grouped sources and page locators', async () => {
  const { citedReferenceIds } = await import('../src/csl-references.mjs');
  const { parseCitationItems, formatCitationLabel, formatReferenceEntry } = await import('../src/csl-record-formatting.mjs');
  const { admitCslProjection, projectCslItem } = await import('../src/csl-projection.mjs');
  const mapping = { id: 'id', type: { value: 'book' }, title: 'name', author: { path: 'writer', as: 'names' }, issued: { path: 'year', as: 'year' } };
  assert.equal(admitCslProjection(mapping).ok, true);
  assert.equal(admitCslProjection({ title: { as: 'invalid' } }).ok, false);
  const source = projectCslItem({ id: '2020:guide', name: 'Tide & Ferry', writer: 'Birch', year: 2020 }, mapping);
  const group = 'cite:@2020:guide, p. 12; @field/guide';
  assert.deepEqual(citedReferenceIds('Read [' + group + '] and [@2020:guide].'), ['2020:guide', 'field/guide', '2020:guide']);
  assert.deepEqual(citedReferenceIds('[cite:@website](https://example.test/)'), []);
  const items = parseCitationItems(group);
  assert.deepEqual(items, [{ key: '2020:guide', locator: 'p. 12' }, { key: 'field/guide', locator: null }]);
  assert.equal(formatCitationLabel(source, items[0].locator), 'Birch 2020, p. 12');
  assert.match(formatReferenceEntry(source), /Tide &amp; Ferry/);
});

test('a citation targets one identified bibliography item and the reference list preserves its id', async () => {
  const { indexCslReferences } = await import('../src/csl-references.mjs');
  const { formatReferenceList } = await import('../src/csl-record-formatting.mjs');
  const keyed = { coast: { title: 'Coastal guide', year: 2025 } };
  assert.equal(indexCslReferences(keyed), keyed);
  const book = { id: 'tide&ferry', type: 'book', title: 'Tides & Ferries' };
  const references = indexCslReferences([book, { id: 24, title: 'Handbook' }, { title: 'Anonymous' },
    { id: 'ambiguous', title: 'First' }, { id: 'ambiguous', title: 'Second' }]);
  assert.deepEqual(Object.keys(references).sort(), ['24', 'tide&ferry']);
  assert.match(formatReferenceList([{ key: book.id, reference: references[book.id] }]), /<li id="ref-tide&amp;ferry">Unknown\. <cite>Tides &amp; Ferries<\/cite>/);
});


test('recognizeCslItem reports missing bibliographic fields', () => {
  const result = recognizeCslItem({ type: 'book' });
  assert.equal(result.admitted, false);
  assert.deepEqual(result.findings.map(finding => finding.path), ['.id', '.title', '.issued', '']);
});

# @red-cup-engineering/csl-json-engineering-services-section

<!-- 561-group-standards:badges:start -->
[![Red Cup Engineering](https://img.shields.io/badge/561%20Group-Red%20Cup%20Engineering-c0392b)](https://github.com/red-cup-engineering)
[![License: MIT](https://img.shields.io/badge/license-MIT-c0392b)](LICENSE)
[![Indigenous data: CARE](https://img.shields.io/badge/Indigenous%20data-CARE-4b6f44)](https://github.com/red-cup-engineering/.github/blob/main/GOVERNANCE.md)
[![Tips welcome](https://img.shields.io/badge/tips-welcome-d4a017)](https://github.com/561-group/.github/blob/main/TIPS.md)
<!-- 561-group-standards:badges:end -->

This package reads, validates and formats bibliography records in Citation Style Language JSON (CSL 1.0.2). Markdown rooms, publications and bibliography tools use the same rules for names, dates, citation keys and author-year labels.

## Reading and writing records

`cslJsonSourceCodec` reads and writes a JSON array of records. The returned reading identifies both the source bytes and the validated item list. The codec rejects duplicate JSON keys and repeated item identifiers.

`recognizeCslItem` reports validation errors by field. `admitCslItem` returns a validated record or throws. The Group’s publication format requires an identifier, a CSL type, a title, a publication year and an author or editor. Additional CSL fields are preserved.

## Package responsibilities

- `src/csl-json.mjs` defines the item types and handles names, dates, DOI normalization and title matching. Source-specific type aliases take precedence when converting external records.
- `src/csl-references.mjs` provides `indexCslReferences` for keyed bibliographies
  and CSL lists. Each distinct identifier in a list names one source.
  `parseCitationItems` reads grouped citations and their page locators.
- `src/csl-record-formatting.mjs` formats author-year labels, bibliography entries
  and reference lists. `formatReferenceList` uses citation order and supplies
  the HTML targets for inline links. This module also produces schema.org
  citation records and generates author-year citation keys.
- `src/csl-projection.mjs` maps fields from a source record to CSL variables. Each mapping is checked against the bundled JSON Schema. It can read nested fields, set a constant or select the first available value.
- The three scripts under `scripts/` convert OpenAlex, PubMed and CrossRef records. Each reads one JSON record from standard input and writes the converted item to standard output.

The bibliography service owns requests to external catalogs. This package owns the record format and conversion code.

## Verification

Run `npm test` in an installed package. The [source and consumer tests](test/source-codec.test.mjs) exercise validation, canonical bytes, grouped citations, page locators, source-field mappings and reference links.

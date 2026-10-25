# Synthetic upstream 0.5.0 whole-book fixture

`wholebook.json` is produced by the real `Store.dispatch` and
`TransferService.export` implementations in
[`mistnest/dsh-cuigengji-plugin@e9b78d065c0a681c6c516d7bb6f66ecb48108203`](https://github.com/mistnest/dsh-cuigengji-plugin/tree/e9b78d065c0a681c6c516d7bb6f66ecb48108203),
whose package version is `0.5.0`. It is **not** a MoJi-created JSON with its
version number changed. All text and entities are synthetic; no user library,
profile, credentials, or real writing is read.

The generator creates a fresh temporary upstream library, asserts that its
physical storage layout is version **5**, exports a `cuigengji-package` version
**1** whole-book package, and removes the temporary library. These are different
version domains. Export is checked not to change the logical source snapshot.

Coverage: volume, current chapter and two chapter revisions, deleted chapter,
character and world entries, two character revisions, chapter evidence and
setting dependencies, setting relationship, nested setting groups, planning
page, nested planning groups, two planning nodes, directed edge, full frame and
note bodies, and writing preset. `provenance.json` records source commit,
package checksum, entity IDs and actual v5 page/node/decoration file mappings.

## Regeneration

Use Node.js 24+ and an isolated checkout of the exact upstream commit with its
genuine dependencies installed. No upstream source modification is required:

```sh
node tests/fixtures/upstream-050/generate.mjs /absolute/path/to/upstream-checkout
```

Generation uses UUIDs and timestamps, so a fresh generation changes the fixture
and its checksums. Commit the package and provenance together. Tests should read
IDs from provenance rather than hard-code UUIDs. The generator only writes the
two fixture files beside itself and a newly allocated temporary library.

This fixture proves an actual upstream export can be produced. Import and
round-trip compatibility are established separately by the MoJi regression
tests, not by this provenance record alone.

## Independent setting-page fixture

`memory-pages.json` and `provenance-memory-pages.json` are generated separately:

```sh
node tests/fixtures/upstream-050/generate-memory-pages.mjs /absolute/path/to/upstream-checkout
```

This uses real upstream `graph.page.create`, group/node/edge APIs, `graph.update`,
`graph.move` and `graph.restore`. It covers a named setting page, an empty page,
nested groups assigned to the named page, two page-local nodes, a main-overview
node, a local edge and a cross-page edge. The character's four saved versions
retain page homes `[named page, named page, null, named page]`. The generator
asserts these facts and a real v5 source library before exporting. It never
rewrites `wholebook.json` or its provenance.

Preserving upstream page metadata is distinct from presenting upstream's
page-isolated setting UI: MoJi's existing setting view is a combined view.

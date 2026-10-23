<h1 align="center">
<a href="https://deadem.com" alt="">
<img alt="deadem" src="https://deadem.com/logo80.svg" height="80" />
</a>
<br/>
deadem
<br/>
</h1>

<a href="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml" alt=""><img src="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml/badge.svg" /></a>
<a href="https://www.npmjs.com/package/@deademx/engine" alt=""><img src="https://img.shields.io/npm/v/%40deademx%2Fengine?label=%40deademx%2Fengine" /></a>
<a href="https://www.npmjs.com/package/deadem" alt=""><img src="https://img.shields.io/npm/v/deadem?label=deadem" /></a>
<a href="https://www.npmjs.com/package/@deademx/cs2" alt=""><img src="https://img.shields.io/npm/v/%40deademx%2Fcs2?label=%40deademx%2Fcs2" /></a>
<a href="https://www.npmjs.com/package/@deademx/dota2" alt=""><img src="https://img.shields.io/npm/v/%40deademx%2Fdota2?label=%40deademx%2Fdota2" /></a>

**deadem** is a collection of JavaScript packages for parsing and playing back Source 2 demos of Deadlock, Counter-Strike 2 and Dota 2 in Node.js, Deno, Bun and browsers.

The packages depend only on:

- [`@bufbuild/protobuf`](https://www.npmjs.com/package/@bufbuild/protobuf): Protobuf descriptors.
- [`snappyjs`](https://www.npmjs.com/package/snappyjs): Snappy decompression.

## Packages

### Published

| Package | Description |
| --- | --- |
| [`@deademx/engine`](./packages/engine/README.md) | Shared Source 2 engine: parser, replay player, interceptor pipeline, broadcast client, configuration. Its README describes the model and the API. |
| [`deadem`](./packages/deadem/README.md) | Deadlock implementation built on top of `@deademx/engine`. |
| [`@deademx/cs2`](./packages/cs2/README.md) | Counter-Strike 2 implementation built on top of `@deademx/engine`. |
| [`@deademx/dota2`](./packages/dota2/README.md) | Dota 2 implementation built on top of `@deademx/engine`. |

### Internal

| Package | Description |
| --- | --- |
| [`@deademx/examples-common`](./packages/examples-common) | Shared helpers, fixtures and support code used by the example packages. |
| [`@deademx/examples-node-deadem`](./packages/examples-node-deadem) | Node.js example scripts, benchmarks and diagnostics for `deadem`. |
| [`@deademx/examples-node-cs2`](./packages/examples-node-cs2) | Node.js example scripts, benchmarks and diagnostics for `@deademx/cs2`. |
| [`@deademx/examples-node-dota2`](./packages/examples-node-dota2) | Node.js example scripts, benchmarks and diagnostics for `@deademx/dota2`. |
| [`@deademx/tools`](./packages/tools) | Repository tooling, such as syncing `.proto` files and building descriptors. |
| [`@deademx/ui`](./packages/ui) | Web app at [deadem.com](https://deadem.com) demonstrating the libraries. |

## Development

```bash
npm install
```

### Example Scripts

Scripts live under `packages/examples-node-<game>/scripts`. Missing demos are downloaded from [deadem.com](https://deadem.com). Pass `--demo=<path>` to parse a local `.dem` file:

```bash
node ./packages/examples-node-deadem/scripts/100_parse.js --demo=./match.dem
node ./packages/examples-node-cs2/scripts/100_parse.js --demo=./match.dem
node ./packages/examples-node-dota2/scripts/100_parse.js --demo=./match.dem
```

### Deadem Explorer

```bash
npm start          # UI dev server
npm run preview    # UI production preview
```

## License

[MIT](./LICENSE)

## Acknowledgements

Inspired by and built upon the work of:

- [dotabuff/manta](https://github.com/dotabuff/manta): Dotabuff's Dota 2 replay parser in Go.
- [saul/demofile-net](https://github.com/saul/demofile-net): CS2 and Deadlock replay parser in C#.

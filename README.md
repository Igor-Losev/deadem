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
<a href="https://www.npmjs.com/package/@deademx/dota2" alt=""><img src="https://img.shields.io/npm/v/%40deademx%2Fdota2?label=%40deademx%2Fdota2" /></a>

Collection of JavaScript packages for parsing and playing back Valve Source 2 demo / replay data in Node.js and modern browsers.

The parsing stack depends only on:

- [`protobufjs`](https://www.npmjs.com/package/protobufjs) — protobuf decoding.
- [`snappyjs`](https://www.npmjs.com/package/snappyjs) — Snappy decompression.

## Packages

### Published

| Package | Description |
| --- | --- |
| [`@deademx/engine`](./packages/engine) | Shared, game-agnostic engine: parser, replay player, interceptor pipeline, broadcast client, configuration. |
| [`deadem`](./packages/deadem) | Deadlock implementation built on top of `@deademx/engine`. |
| [`@deademx/dota2`](./packages/dota2) | Dota 2 implementation built on top of `@deademx/engine`. |

### Internal

| Package | Description |
| --- | --- |
| [`@deademx/examples-common`](./packages/examples-common) | Shared helpers, fixtures, and support code used by the example packages. |
| [`@deademx/examples-node-deadem`](./packages/examples-node-deadem) | Node.js example scripts, benchmarks, and diagnostics for `deadem`. |
| [`@deademx/examples-node-dota2`](./packages/examples-node-dota2) | Node.js example scripts, benchmarks, and diagnostics for `@deademx/dota2`. |
| [`@deademx/ui`](./packages/ui) | Published web app at [deadem.com](https://deadem.com) demonstrating the libraries. |

## Documentation

- **[`@deademx/engine`](./packages/engine/README.md)** — shared parsing model, player lifecycle, interceptors, API reference, and direct-engine usage. Read this first to understand the concepts that all game-specific packages share.
- **[`deadem`](./packages/deadem/README.md)** — Deadlock installation, examples, Deadlock-specific extraction snippets, compatibility, and performance benchmarks.
- **[`@deademx/dota2`](./packages/dota2/README.md)** — Dota 2 installation, examples, and Dota 2-specific extraction snippets.

## License

This project is licensed under the [MIT](./LICENSE) License.

## Acknowledgements

Inspired by and built upon the work of:

- [dotabuff/manta](https://github.com/dotabuff/manta) — Dotabuff's Dota 2 replay parser in Go
- [saul/demofile-net](https://github.com/saul/demofile-net) — CS2 / Deadlock replay parser in C#

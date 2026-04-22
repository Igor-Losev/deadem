<h1 align="center">
<a href="https://deadem.com" alt="">
<img alt="deadem" src="https://deadem.com/logo80.svg" height="80" />
</a>
<br/>
deadem
<br/>
</h1>

<a href="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml" alt=""><img src="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml/badge.svg" /></a>

**deadem** is a family of JavaScript packages for parsing and playing back Valve Source 2 demo/replay data in Node.js and modern browsers.

The parsing stack relies on two external dependencies:

- [`protobufjs`](https://www.npmjs.com/package/protobufjs) for protobuf decoding
- [`snappyjs`](https://www.npmjs.com/package/snappyjs) for Snappy decompression

## Packages

### Published

- [`@deademx/engine`](./packages/engine/README.md)
  Shared engine with the game-agnostic parser, player, interceptor pipeline, broadcast support, and core configuration model.

- [`deadem`](./packages/deadem/README.md)
  Original Deadlock implementation built on top of `@deademx/engine`, with Deadlock-specific message types, examples, and package docs.

- [`@deademx/dota2`](./packages/dota2/README.md)
  Dota 2 implementation built on top of `@deademx/engine`, with Dota 2-specific message types, examples, and package docs.

### Internal

- `@deademx/examples-common`
  Shared helpers, fixtures, and support code used by the example packages.

- `@deademx/examples-node-deadem`
  Node.js example scripts, benchmarks, and diagnostics for the `deadem` package.

- `@deademx/examples-node-dota2`
  Node.js example scripts, benchmarks, and diagnostics for the `@deademx/dota2` package.

- `@deademx/ui`
  Published page on [deadem.com](https://deadem.com) used to demonstrate the capabilities of the published libraries.

## Documentation

- Start with [`@deademx/engine`](./packages/engine/README.md) for the shared parsing model and engine concepts.
- Use [`deadem`](./packages/deadem/README.md) for Deadlock-specific installation, examples, compatibility, and performance notes.
- Use [`@deademx/dota2`](./packages/dota2/README.md) for Dota 2-specific installation, examples, compatibility, and performance notes.


<h1 align="center">
<a href="https://deadem.com" alt="">
<img alt="deadem" src="https://deadem.com/logo80.svg" height="80" />
</a>
<br/>
@deademx/dota2
<br/>
</h1>

<a href="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml" alt=""><img src="https://github.com/Igor-Losev/deadem/actions/workflows/ci.yml/badge.svg" /></a>
<a href="https://www.npmjs.com/package/@deademx/dota2" alt=""><img src="https://img.shields.io/npm/v/%40deademx%2Fdota2" /></a>

**@deademx/dota2** is the Dota 2 implementation built on top of [`@deademx/engine`](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md).

For the shared parser model, player lifecycle, interceptors, and engine configuration, see the [`@deademx/engine` documentation](https://github.com/Igor-Losev/deadem/blob/main/packages/engine/README.md).

## Installation

### Node.js

```shell
npm install @deademx/dota2 --save
```

```js
import { Parser } from '@deademx/dota2';
```

### Browser

```html
<script src="//cdn.jsdelivr.net/npm/@deademx/dota2@0.X.X/dist/deadem-dota2.min.js"></script>
```

```js
const { Parser } = window.deademDota2;
```

## Examples

### Node.js

Replay example scripts look for demo files in `/demos`. If a local demo file is missing, the example helpers download it automatically from the public S3 bucket. HTTP Broadcast examples require a valid match identifier or a previously saved `.bin` stream file.

| No. | Description | Link | Command |
| --- | --- | --- | --- |
| 100 | Parse a single replay file | [100_parse.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/100_parse.js) | `node ./packages/examples-node-dota2/scripts/100_parse.js` |
| 101 | Parse multiple replay files | [101_parse_multiple.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/101_parse_multiple.js) | `node ./packages/examples-node-dota2/scripts/101_parse_multiple.js --matches="8773493455,8777738576"` |
| 102 | Parse selected packet types | [102_parse_selective.js](https://github.com/Igor-Losev/deadem/blob/main/packages/examples-node-dota2/scripts/102_parse_selective.js) | `node ./packages/examples-node-dota2/scripts/102_parse_selective.js` |

## Usage

### Demo File

```js
import { Parser, ParserConfiguration, Printer } from '@deademx/dota2';

const parser = new Parser(new ParserConfiguration({ parserThreads: 0 }));
const printer = new Printer(parser);

await parser.parse(readable);
await parser.dispose();

printer.printStats();
```

### Data Extraction

Extract Dota 2 chat messages:

```js
import { InterceptorStage, MessagePacketType, Parser } from '@deademx/dota2';

const parser = new Parser();

parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
    if (messagePacket.type === MessagePacketType.DOTA_UM_CHAT_MESSAGE) {
        console.log(`CHAT_MESSAGE: ${messagePacket.data.text}`);
    }
});

await parser.parse(readable);
```

Post-parse Dota 2 query:

```js
await parser.parse(readable);

const demo = parser.getDemo();
const entities = demo.getEntities();
```

### Player

Inspect Dota 2 state at a specific tick:

```js
import { createReadStream } from 'node:fs';

import { Player } from '@deademx/dota2';

const player = new Player();
const readable = createReadStream(PATH_TO_DEM_FILE);

await player.load(readable);
await player.seekToTick(player.getLastTick());

const demo = player.getDemo();
const entities = demo.getEntities();

console.log(`Entities at last tick: ${entities.length}`);

await player.dispose();
```

## Compatibility

- **Node.js:** v18.0.0 and above
- **Browsers:** latest Chrome, Firefox, Safari, and Edge

## Performance

Performance depends on the replay, selected packet filters, and how often entity data is unpacked.

| Scenario | Expected impact | Notes |
| --- | --- | --- |
| Parse all packet types | Highest coverage, higher CPU and memory cost | Best when you need complete replay state |
| Filter to selected `MessagePacketType` values | Lower parse cost | Useful for chat-only or event-focused extraction |
| Call `entity.unpackFlattened()` frequently | Higher per-entity overhead | Prefer targeted reads instead of unpacking every entity |
| Keep `parserThreads = 0` | Lowest coordination overhead | Good default for smaller workloads and browser usage |

## License

This project is licensed under the [MIT](https://github.com/Igor-Losev/deadem/blob/main/LICENSE) License.

## Acknowledgements

This project was inspired by and built upon the work of the following repositories:

- [dotabuff/manta](https://github.com/dotabuff/manta) - Dotabuff's Dota 2 replay parser in Go
- [saul/demofile-net](https://github.com/saul/demofile-net) - CS2 / Deadlock replay parser in C#

import { DemoSource, Parser, ParserConfiguration, Printer } from '#root/index.js';

import FileSystem from '#core/FileSystem.js';

(async () => {
    const MATCH_ID = 38625795;

    const parserConfiguration = new ParserConfiguration({ parserThreads: 3 });
    const parser = new Parser(parserConfiguration);
    const printer = new Printer(parser);

    const readable = FileSystem.createReadStream(`./${MATCH_ID}.bin`);

    await parser.parse(readable, DemoSource.HTTP_BROADCAST);

    printer.printStats();
})();


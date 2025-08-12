import { DemoSource, Parser, ParserConfiguration, Printer } from '#root/index.js';

import DemoFile from '#root/examples/common/DemoFile.js';

import DemoProvider from './helpers/DemoProvider.js';

(async () => {
    const parserConfiguration = new ParserConfiguration({ parserThreads: 3 });
    const parser = new Parser(parserConfiguration);
    const printer = new Printer(parser);

    const readable = await DemoProvider.read(DemoFile.BROADCAST_38625795);

    await parser.parse(readable, DemoSource.HTTP_BROADCAST);

    printer.printStats();
})();


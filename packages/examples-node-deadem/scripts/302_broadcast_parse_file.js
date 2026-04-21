import { DemoSource, Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from '@deadem/examples-common/data/DemoFile.js';

import DemoProvider from '@deadem/examples-common/data/DemoProvider.js';

(async () => {
    const parserConfiguration = new ParserConfiguration({ parserThreads: 3 });
    const parser = new Parser(parserConfiguration);
    const printer = new Printer(parser);

    const readable = await DemoProvider.read(DemoFile.DEADLOCK_BROADCAST_38625795);

    await parser.parse(readable, DemoSource.HTTP_BROADCAST);

    printer.printStats();
})();


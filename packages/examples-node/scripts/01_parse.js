import { Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';

import DemoProvider from '#root/providers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_51541751);

    const parser = new Parser(new ParserConfiguration({ parserThreads: 0 }));
    const printer = new Printer(parser);

    await parser.parse(reader);

    await parser.dispose();

    printer.printStats();
})();


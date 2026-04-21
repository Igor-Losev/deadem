import { Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from '@deadem/examples-common/data/DemoFile.js';

import DemoProvider from '@deadem/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.DEADLOCK_REPLAY_75438101);

    const parser = new Parser(new ParserConfiguration({ parserThreads: 3 }));

    await parser.parse(reader);
    await parser.dispose();

    const printer = new Printer(parser);

    printer.printStats();
})();

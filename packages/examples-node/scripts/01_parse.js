import { Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';

import DemoProvider from '#root/providers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_38969017);

    const parser = new Parser(new ParserConfiguration({ parserThreads: 3 }));
    const printer = new Printer(parser);

    await parser.parse(reader);

    printer.printStats();
})();


import { Parser, ParserConfiguration, Printer } from '#root/index.js';

import DemoFile from '#root/examples/common/DemoFile.js';

import DemoProvider from './helpers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.MATCH_38571265);

    const parser = new Parser(new ParserConfiguration({ parserThreads: 3 }));
    const printer = new Printer(parser);

    await parser.parse(reader);

    printer.printStats();
})();

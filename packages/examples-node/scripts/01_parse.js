import { Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';

import DemoProvider from '#root/providers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_51541762);

    const parser = new Parser(new ParserConfiguration({ parserThreads: 0 }));

    await parser.parse(reader);
    await parser.dispose();

    const printer = new Printer(parser);

    printer.printMemoryStats();
    printer.printPerformanceStats();
    printer.printPacketStats();
})();

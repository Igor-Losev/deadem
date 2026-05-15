import { Parser, ParserConfiguration, Printer } from '@deademx/cs2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.CS2_REPLAY_SAMPLE);

    const parser = new Parser(new ParserConfiguration({
        parserThreads: 0
    }));

    await parser.parse(reader);
    await parser.dispose();

    const printer = new Printer(parser);

    printer.printStats();
})();

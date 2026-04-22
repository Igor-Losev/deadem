import { Parser, ParserConfiguration, Printer } from '@deademx/dota2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.DOTA2_REPLAY_8777738576);

    const parser = new Parser(new ParserConfiguration({ parserThreads: 0 }));

    await parser.parse(reader);
    await parser.dispose();

    const printer = new Printer(parser);

    printer.printStats();
})();

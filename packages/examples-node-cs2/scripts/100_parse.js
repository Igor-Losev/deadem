import { Parser, ParserConfiguration, Printer } from '@deademx/cs2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.resolve(DemoFile.CS2_REPLAY_20260815_SPIRIT_VS_BIG_M3_MIRAGE);

    const parser = new Parser(ParserConfiguration.DEFAULT);

    await parser.parse(reader);
    await parser.dispose();

    const printer = new Printer(parser);

    printer.printStats();
})();

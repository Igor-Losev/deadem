import { Parser, ParserConfiguration, Printer } from '@deademx/cs2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.resolve(DemoFile.CS2_REPLAY_20260511_FURIA_VS_SPIRIT_M1_DUST2);

    const parser = new Parser(ParserConfiguration.DEFAULT);

    await parser.parse(reader);
    await parser.dispose();

    const printer = new Printer(parser);

    printer.printStats();
})();

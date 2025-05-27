import { Parser, Printer } from '#root/index.js';

import DemoFile from './helpers/DemoFile.js';
import DemoProvider from './helpers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.MATCH_35244871);

    const parser = new Parser();
    const printer = new Printer(parser);

    await parser.parse(reader);

    printer.printStats();
})();

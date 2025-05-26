import { Parser } from './../index.js';

import DemoFile from './helpers/DemoFile.js';
import DemoProvider from './helpers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.MATCH_35244871);

    const parser = new Parser();

    await parser.parse(reader);
})();

'use strict';

const Parser = require('./../src/Parser');

const DemoFile = require('./helpers/DemoFile'),
    DemoProvider = require('./helpers/DemoProvider');

(async () => {
    const reader = await DemoProvider.read(DemoFile.MATCH_35244871);

    const parser = new Parser();

    await parser.parse(reader);
})();

'use strict';

const fs = require('node:fs'),
    path = require('node:path');

const Parser = require('./../src/Parser');

(async () => {
    const DEMO_PATH = path.resolve(__dirname, './../demos/35244871.dem');
    const PARSER_THREADS = 0;

    const parser = new Parser(PARSER_THREADS);

    const reader = fs.createReadStream(DEMO_PATH, { highWaterMark: 65 * 1024 });

    parser.start(reader);
})();

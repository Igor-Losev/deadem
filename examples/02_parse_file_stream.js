'use strict';

const fs = require('node:fs'),
    path = require('node:path');

const Parser = require('./../src/Parser');

const CONFIG = {
    path: path.resolve(__dirname, './../demos/35244871.dem')
};

(async () => {
    const parser = new Parser();

    const reader = fs.createReadStream(CONFIG.path, { highWaterMark: 65 * 1024 });

    parser.start(reader);
})();

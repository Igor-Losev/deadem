'use strict';

const fs = require('node:fs'),
    path = require('node:path'),
    Stream = require('node:stream');

const Parser = require('./../src/Parser');

const CONFIG = {
    path: path.resolve(__dirname, './../demos/35244871.dem')
};

(async () => {
    const buffer = fs.readFileSync(CONFIG.path);

    const parser = new Parser();

    const reader = Stream.Readable.from(buffer);

    parser.start(reader);
})();

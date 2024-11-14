'use strict';

const fs = require('node:fs'),
    path = require('node:path'),
    Stream = require('node:stream');

const Parser = require('./../src/Parser');

(async () => {
    const DEMO_PATH = path.resolve(__dirname, './../demos/21438112.dem');
    const PARSER_THREADS = 4;

    const buffer = fs.readFileSync(DEMO_PATH);

    const parser = new Parser(PARSER_THREADS);

    const reader = Stream.Readable.from(buffer);

    parser.start(reader);
})();

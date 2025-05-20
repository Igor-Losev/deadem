'use strict';

const assert = require('node:assert/strict'),
    Stream = require('node:stream');

const LoggerProvider = require('./providers/LoggerProvider.instance');

const ParserConfiguration = require('./ParserConfiguration'),
    ParserEngine = require('./ParserEngine');

const logger = LoggerProvider.getLogger('Parser');

class Parser {
    /**
     * @constructor
     * @param {ParserConfiguration=} configuration
     */
    constructor(configuration = ParserConfiguration.DEFAULT) {
        if (!(configuration instanceof ParserConfiguration)) {
            throw new Error('Invalid configuration: expected an instance of ParserConfiguration');
        }

        this._engine = new ParserEngine(configuration);
    }

    /**
     * @public
     * @returns {Demo}
     */
    getDemo() {
        return this._engine.demo;
    }

    /**
     * @public
     * @param {Stream.Readable} reader
     */
    start(reader) {
        assert(reader instanceof Stream.Readable);

        this._engine.start(reader);
    }
}

module.exports = Parser;

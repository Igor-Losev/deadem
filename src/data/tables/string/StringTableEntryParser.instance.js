'use strict';

const LoggerProvider = require('../../../providers/LoggerProvider.instance'),
    ProtoProvider = require('../../../providers/ProtoProvider.instance')

const StringTableEntry = require('./StringTableEntry');

const logger = LoggerProvider.getLogger('StringTableEntry');

class StringTableEntryParser {
    constructor() {

    }

    /**
     * @public
     * @param {StringTable} stringTable
     * @param {Buffer|null} value
     */
    parse(stringTable, value) {
        if (value === null) {

        }
    }

    static instance = new StringTableEntryParser();
}

module.exports = StringTableEntryParser.instance;

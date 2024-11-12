'use strict';

const assert = require('node:assert/strict');

const StringTableType = require('./../../enums/StringTableType');

const StringTableEntry = require('./StringTableEntry'),
    StringTableInstructions = require('./StringTableInstructions');

class StringTable {
    /**
     * @public
     * @param {StringTableType} type
     * @param {number} flags
     * @param {Array<StringTableEntry>=} entries
     * @param {StringTableInstructions=} instructions
     */
    constructor(type, flags, entries, instructions) {
        assert(type instanceof StringTableType);
        assert(Number.isInteger(flags));
        assert(!entries || (Array.isArray(entries) && entries.every(e => e instanceof StringTableEntry)));
        assert(!instructions || instructions instanceof StringTableInstructions);

        this._type = type;
        this._flags = flags;
        this._entries = entries || [ ];
        this._instructions = instructions || null;

        this._registry = {
            entryById: new Map()
        };
    }

    get type() {
        return this._type;
    }

    get flags() {
        return this._flags;
    }

    get entries() {
        return this._entries;
    }

    get instructions() {
        return this._instructions;
    }

    /**
     * @public
     * @returns {Number}
     */
    getEntriesCount() {
        return this._registry.entryById.size;
    }

    /**
     * @public
     * @param {Number} id
     * @returns {StringTableEntry|null}
     */
    getEntryById(id) {
        return this._registry.entryById.get(id) || null;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsValueCompressionSupported() {
        return (this._flags & 1) !== 0;
    }

    /**
     * @public
     * @param {StringTableEntry} entry
     * @returns {void}
     */
    updateEntry(entry) {
        this._registry.entryById.set(entry.id, entry);
    }
}

module.exports = StringTable

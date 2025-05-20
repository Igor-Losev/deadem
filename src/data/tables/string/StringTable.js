'use strict';

const assert = require('node:assert/strict');

const StringTableType = require('./../../enums/StringTableType');

const StringTableInstructions = require('./StringTableInstructions');

class StringTable {
    /**
     * @public
     * @param {StringTableType} type
     * @param {number} flags
     * @param {StringTableInstructions=} instructions
     */
    constructor(type, flags, instructions) {
        assert(type instanceof StringTableType);
        assert(Number.isInteger(flags));
        assert(!instructions || instructions instanceof StringTableInstructions);

        this._type = type;
        this._flags = flags;
        this._instructions = instructions || null;

        this._registry = {
            entryById: new Map()
        };
    }

    /**
     * @returns {StringTableType}
     */
    get type() {
        return this._type;
    }

    /**
     * @returns {number}
     */
    get flags() {
        return this._flags;
    }

    /**
     * @returns {StringTableInstructions|null}
     */
    get instructions() {
        return this._instructions;
    }

    /**
     * @public
     * @returns {Array<StringTableEntry>}
     */
    getEntries() {
        return Array.from(this._registry.entryById.values());
    }

    /**
     * @public
     * @returns {number}
     */
    getEntriesCount() {
        return this._registry.entryById.size;
    }

    /**
     * @public
     * @param {number} id
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

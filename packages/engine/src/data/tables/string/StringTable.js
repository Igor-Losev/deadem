/** @import StringTableEntry from './StringTableEntry.js' */

import Assert from '#core/Assert.js';

import StringTableType from '#data/enums/StringTableType.js';

import StringTableInstructions from './StringTableInstructions.js';

/**
 * Decodes a raw string-table entry payload into a structured value.
 *
 * @typedef {(buffer: Uint8Array) => *} StringTableDecoderFn
 */

/**
 * @template {string} [C=string]
 * @template [D=*]
 */
class StringTable {
    /**
     * @public
     * @param {number} id
     * @param {StringTableType<C, D>} type
     * @param {number} flags
     * @param {StringTableInstructions|null=} instructions
     * @param {StringTableDecoderFn|null} [decoder]
     */
    constructor(id, type, flags, instructions, decoder = null) {
        Assert.isTrue(Number.isInteger(id) && id >= 0);
        Assert.isTrue(type instanceof StringTableType);
        Assert.isTrue(Number.isInteger(flags));
        Assert.isTrue(!instructions || instructions instanceof StringTableInstructions);

        /** @private */
        this._id = id;
        /** @private */
        this._type = type;
        /** @private */
        this._flags = flags;
        /** @private */
        this._instructions = instructions || null;

        /** @private */
        this._decoder = decoder || null;

        /** @private */
        this._registry = {
            entryById: new Map()
        };
    }

    /**
     * @returns {number}
     */
    get id() {
        return this._id;
    }

    /**
     * @returns {StringTableType<C, D>}
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
     * @returns {Function|null}
     */
    get decoder() {
        return this._decoder;
    }

    /**
     * @public
     * @returns {Array<StringTableEntry<C, D>>}
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
     * @returns {StringTableEntry<C, D>|null}
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
     * @template {string} T
     * @template TD
     * @param {StringTableType<T, TD>} type
     * @returns {this is StringTable<T, TD>}
     */
    is(type) {
        return /** @type {StringTableType<string, *>} */ (this._type).code === type.code;
    }

    /**
     * @public
     * @param {StringTableEntry<C, D>} entry
     * @returns {void}
     */
    registerEntry(entry) {
        this._registry.entryById.set(entry.id, entry);
    }
}

export default StringTable;

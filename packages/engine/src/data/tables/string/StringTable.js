import Assert from '#core/Assert.js';

import StringTableType from '#data/enums/StringTableType.js';

import StringTableInstructions from './StringTableInstructions.js';

class StringTable {
    /**
     * @public
     * @param {number} id
     * @param {StringTableType} type
     * @param {number} flags
     * @param {StringTableInstructions|null=} instructions
     * @param {Function|null} [decoder=null]
     */
    constructor(id, type, flags, instructions, decoder = null) {
        Assert.isTrue(Number.isInteger(id) && id >= 0);
        Assert.isTrue(type instanceof StringTableType);
        Assert.isTrue(Number.isInteger(flags));
        Assert.isTrue(!instructions || instructions instanceof StringTableInstructions);

        this._id = id;
        this._type = type;
        this._flags = flags;
        this._instructions = instructions || null;

        this._decoder = decoder || null;

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
     * @returns {Function|null}
     */
    get decoder() {
        return this._decoder;
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
    registerEntry(entry) {
        this._registry.entryById.set(entry.id, entry);
    }
}

export default StringTable;

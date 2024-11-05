'use strict';

class StringTable {
    /**
     * @public
     * @static
     *
     * @param {StringTableType} type
     * @param {number} flags
     * @param {number} userDataSizeBits
     * @param {boolean} userDataFixedSize
     * @param {boolean} usingVarintBitcounts
     */
    constructor(type, flags, userDataSizeBits, userDataFixedSize, usingVarintBitcounts) {
        this._type = type;
        this._flags = flags;
        this._userDataSizeBits = userDataSizeBits;
        this._userDataFixedSize = userDataFixedSize;
        this._usingVarintBitcounts = usingVarintBitcounts;

        this._registry = {
            entryById: new Map()
        };
    }

    get type() {
        return this._type;
    }

    get userDataFixedSize() {
        return this._userDataFixedSize;
    }

    get userDataSizeBits() {
        return this._userDataSizeBits;
    }

    get usingVarintBitcounts() {
        return this._usingVarintBitcounts;
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

module.exports = StringTable;

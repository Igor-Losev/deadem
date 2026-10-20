/** @import StringTableOperation from '../../enums/StringTableOperation.js' */

/** @import StringTable from './StringTable.js' */
/** @import StringTableEntry from './StringTableEntry.js' */

class StringTableMutationEvent {
    /**
     * @public
     * @constructor
     * @param {StringTableOperation} operation
     * @param {StringTable} table
     * @param {Array<StringTableEntry>} entries - Created or changed entries. Empty for a removal.
     */
    constructor(operation, table, entries) {
        /** @private */
        this._operation = operation;
        /** @private */
        this._table = table;
        /** @private */
        this._entries = entries;
    }

    /**
     * @public
     * @returns {StringTableOperation}
     */
    get operation() {
        return this._operation;
    }

    /**
     * @public
     * @returns {StringTable}
     */
    get table() {
        return this._table;
    }

    /**
     * @public
     * @returns {Array<StringTableEntry>}
     */
    get entries() {
        return this._entries;
    }
}

export default StringTableMutationEvent;

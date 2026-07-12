/** @import StringTableType from '#data/enums/StringTableType.js' */

/** @import StringTable from './StringTable.js' */

import Assert from '#core/Assert.js';

class StringTableEntry {
    /**
     * @public
     * @constructor
     * @param {StringTable} table
     * @param {number} id
     * @param {string} key
     * @param {Uint8Array|Array<*>|null} raw
     */
    constructor(table, id, key, raw) {
        Assert.isTrue(typeof id === 'number' && Number.isInteger(id));
        Assert.isTrue(typeof key === 'string');

        this._table = table;
        this._id = id;
        this._key = key;

        if (raw === null) {
            this._decoded = true;
            this._raw = null;
            this._value = null;

            return;
        }

        if (table.type.lazy && table.decoder !== null) {
            this._decoded = false;
            this._raw = raw;
            this._value = null;
        } else {
            this._decoded = true;
            this._raw = null;
            this._value = table.decoder ? table.decoder(raw) : raw;
        }
    }

    /**
     * @returns {StringTableType}
     */
    get type() {
        return this._table.type;
    }

    /**
     * @returns {number}
     */
    get id() {
        return this._id;
    }

    /**
     * @returns {string}
     */
    get key() {
        return this._key;
    }

    /**
     * @returns {Uint8Array|null|*}
     */
    get value() {
        if (this._decoded) {
            return this._value;
        }

        if (this._table.decoder) {
            this._value = this._table.decoder(this._raw);
            this._decoded = true;

            return this._value;
        }

        return this._raw;
    }
}

export default StringTableEntry;

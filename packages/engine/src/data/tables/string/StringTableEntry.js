/** @import StringTableType from '../../enums/StringTableType.js' */

/** @import StringTable from './StringTable.js' */

import Assert from '../../../core/Assert.js';

/**
 * @template {string} [C=string]
 * @template [D=*]
 */
class StringTableEntry {
    /**
     * @public
     * @constructor
     * @param {StringTable<C, D>} table
     * @param {number} id
     * @param {string} key
     * @param {Uint8Array|Array<*>|null} raw
     */
    constructor(table, id, key, raw) {
        Assert.isTrue(typeof id === 'number' && Number.isInteger(id));
        Assert.isTrue(typeof key === 'string');

        /** @private */
        this._table = table;
        /** @private */
        this._id = id;
        /** @private */
        this._key = key;

        if (raw === null) {
            /** @private */
            this._decoded = true;
            /** @private */
            this._raw = null;
            /** @private */
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
     * @returns {StringTableType<C, D>}
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
     * @returns {D}
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

        return /** @type {D} */ (this._raw);
    }

    /**
     * @public
     * @template {string} T
     * @template TD
     * @param {StringTableType<T, TD>} type
     * @returns {this is StringTableEntry<T, TD>}
     */
    is(type) {
        return /** @type {StringTableType<string, *>} */ (this._table.type).code === type.code;
    }
}

export default StringTableEntry;

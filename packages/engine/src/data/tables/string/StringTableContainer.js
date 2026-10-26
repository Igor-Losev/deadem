/** @import StringTableType from '../../enums/StringTableType.js' */

import Assert from '../../../core/Assert.js';

import StringTable from './StringTable.js';

/**
 * Pure data container for string tables. Owns id/name lookups.
 */
class StringTableContainer {
    /**
     * @public
     * @constructor
     */
    constructor() {
        /** @private */
        this._tableById = new Map();
        /** @private */
        this._tableByName = new Map();
    }

    /**
     * @public
     * @returns {number}
     */
    get size() {
        return this._tableById.size;
    }

    /**
     * @public
     * @param {number} id
     * @returns {StringTable|null}
     */
    getById(id) {
        return this._tableById.get(id) || null;
    }

    /**
     * @public
     * @param {string} name
     * @returns {StringTable|null}
     */
    getByName(name) {
        return this._tableByName.get(name) || null;
    }

    /**
     * @public
     * @param {StringTableType} type
     * @returns {StringTable|null}
     */
    getByType(type) {
        return this.getByName(type.name);
    }

    /**
     * @public
     * @returns {Array<StringTable>}
     */
    getTables() {
        return Array.from(this._tableById.values());
    }

    /**
     * Inserts a table into the container. Replaces any existing table
     * with the same id or name.
     *
     * @internal
     * @public
     * @param {StringTable} stringTable
     */
    register(stringTable) {
        Assert.isTrue(stringTable instanceof StringTable);

        this._tableById.set(stringTable.id, stringTable);
        this._tableByName.set(stringTable.type.name, stringTable);
    }

    /**
     * Removes a table from the container.
     *
     * @internal
     * @public
     * @param {StringTable} stringTable
     */
    unregister(stringTable) {
        Assert.isTrue(stringTable instanceof StringTable);

        this._tableById.delete(stringTable.id);
        this._tableByName.delete(stringTable.type.name);
    }

    /**
     * Removes all tables.
     *
     * @internal
     * @public
     */
    clear() {
        this._tableById.clear();
        this._tableByName.clear();
    }
}

export default StringTableContainer;

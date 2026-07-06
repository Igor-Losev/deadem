import Assert from '#core/Assert.js';
import EventEmitter from '#core/EventEmitter.js';

import StringTableEvent from '#data/enums/StringTableEvent.js';

import StringTable from './StringTable.js';

/**
 * Pure data container for string tables. Owns id/name lookups and a
 * {@link EventEmitter} for lifecycle events.
 */
class StringTableContainer {
    /**
     * @public
     * @constructor
     */
    constructor() {
        this._eventEmitter = new EventEmitter(this);

        this._tableById = new Map();
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
     * @param {String} name
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
     * with the same id or name. Fires TABLE_CREATED + TABLE_CHANGED.
     *
     * @public
     * @param {StringTable} stringTable
     * @param {Array<StringTableEntry>} [entries=null] — affected entries (all new entries for a create)
     */
    register(stringTable, entries = null) {
        Assert.isTrue(stringTable instanceof StringTable);

        this._tableById.set(stringTable.id, stringTable);
        this._tableByName.set(stringTable.type.name, stringTable);

        const affected = entries || stringTable.getEntries();

        this._eventEmitter.fire(StringTableEvent.TABLE_CREATED.name, stringTable, affected);
        this._eventEmitter.fire(StringTableEvent.TABLE_CHANGED.name, stringTable, affected);
    }

    /**
     * Signals that a table's entries were mutated. Fires TABLE_UPDATED + TABLE_CHANGED.
     *
     * @public
     * @param {StringTable} stringTable
     * @param {Array<StringTableEntry>} [entries=null] — only the entries that changed
     */
    markUpdated(stringTable, entries = null) {
        Assert.isTrue(stringTable instanceof StringTable);

        const affected = entries || stringTable.getEntries();

        this._eventEmitter.fire(StringTableEvent.TABLE_UPDATED.name, stringTable, affected);
        this._eventEmitter.fire(StringTableEvent.TABLE_CHANGED.name, stringTable, affected);
    }

    /**
     * Signals that a table's state changed without an explicit update (e.g. snapshot).
     * Fires TABLE_CHANGED.
     *
     * @public
     * @param {StringTable} stringTable
     * @param {Array<StringTableEntry>} [changedEntries=null] — resupplied entries, if known
     */
    markChanged(stringTable, entries = null) {
        Assert.isTrue(stringTable instanceof StringTable);

        const affected = entries || stringTable.getEntries();

        this._eventEmitter.fire(StringTableEvent.TABLE_CHANGED.name, stringTable, affected);
    }

    /**
     * Removes all tables. Fires TABLE_REMOVED for each one before clearing.
     *
     * @public
     */
    clear() {
        this._tableById.forEach((stringTable) => {
            this._eventEmitter.fire(StringTableEvent.TABLE_REMOVED.name, stringTable, null);
        });

        this._tableById.clear();
        this._tableByName.clear();
    }

    /**
     * @public
     * @param {StringTableEvent} event
     * @param {Function} callback
     */
    subscribe(event, callback) {
        Assert.isTrue(event instanceof StringTableEvent);
        Assert.isTrue(typeof callback === 'function');

        this._eventEmitter.register(event.name, callback);
    }

    /**
     * @public
     * @param {StringTableEvent} event
     * @param {Function} callback
     */
    unsubscribe(event, callback) {
        Assert.isTrue(event instanceof StringTableEvent);
        Assert.isTrue(typeof callback === 'function');

        this._eventEmitter.unregister(event.name, callback);
    }
}

export default StringTableContainer;

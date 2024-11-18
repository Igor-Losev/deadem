'use strict';

class StringTableEvent {
    /**
     * @public
     * @constructor
     * @param {String} code
     * @param {String} name
     */
    constructor(code, name) {
        this._code = code;
        this._name = name;
    }

    get code() {
        return this._code;
    }

    get name() {
        return this._name;
    }

    /**
     * @public
     * @static
     * @returns {StringTableEvent}
     */
    static get TABLE_CHANGED() {
        return tableChanged;
    }

    /**
     * @public
     * @static
     * @returns {StringTableEvent}
     */
    static get TABLE_CREATED() {
        return tableCreated;
    }

    /**
     * @public
     * @static
     * @returns {StringTableEvent}
     */
    static get TABLE_REMOVED() {
        return tableRemoved;
    }

    /**
     * @public
     * @static
     * @returns {StringTableEvent}
     */
    static get TABLE_UPDATED() {
        return tableUpdated;
    }
}

const tableChanged = new StringTableEvent('TABLE_CHANGED', 'table-changed');
const tableCreated = new StringTableEvent('TABLE_CREATED', 'table-created');
const tableRemoved = new StringTableEvent('TABLE_REMOVED', 'table-removed');
const tableUpdated = new StringTableEvent('TABLE_UPDATED', 'table-updated');

module.exports = StringTableEvent;

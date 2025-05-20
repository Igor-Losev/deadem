'use strict';

const assert = require('node:assert/strict');

const REGEX = /(?<base>[^*< >\n\[\]]+)(< (?<generic>.*) >)?(\[(?<count>\d+)?\])?(?<pointer>\*)?/;

class FieldDefinition {
    /**
     * @public
     * @constructor
     * @param {String} baseType
     * @param {FieldDefinition|null} generic
     * @param {number|null} count
     * @param {boolean} pointer
     */
    constructor(baseType, generic, count, pointer) {
        assert(typeof baseType === 'string' && baseType.length > 0);
        assert(generic === null || generic instanceof FieldDefinition);
        assert(count === null || Number.isInteger(count));
        assert(typeof pointer === 'boolean');

        this._baseType = baseType;
        this._generic = generic;
        this._count = count;
        this._pointer = pointer;
    }

    get baseType() {
        return this._baseType;
    }

    get generic() {
        return this._generic;
    }

    get count() {
        return this._count;
    }

    get pointer() {
        return this._pointer;
    }

    /**
     * @public
     * @static
     * @param {String} varType
     * @returns {FieldDefinition}
     */
    static parse(varType) {
        assert(typeof varType === 'string');

        const groups = REGEX.exec(varType).groups;

        const baseType = groups.base;
        const generic = groups.generic ? FieldDefinition.parse(groups.generic) : null;
        const count = groups.count ? parseInt(groups.count) : null;
        const pointer = groups.pointer === '*';

        return new FieldDefinition(baseType, generic, count, pointer);
    }
}

module.exports = FieldDefinition;

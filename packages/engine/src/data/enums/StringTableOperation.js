import Assert from '../../core/Assert.js';

const registry = {
    byCode: new Map(),
    byId: new Map()
};

class StringTableOperation {
    /**
     * @constructor
     * @param {string} code
     * @param {number} id
     */
    constructor(code, id) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(Number.isInteger(id));

        /** @private */
        this._code = code;
        /** @private */
        this._id = id;

        registry.byCode.set(code, this);
        registry.byId.set(id, this);
    }

    /**
     * @returns {string}
     */
    get code() {
        return this._code;
    }

    /**
     * @returns {number}
     */
    get id() {
        return this._id;
    }

    /**
     * @public
     * @static
     * @param {string} code
     * @returns {StringTableOperation|null}
     */
    static parse(code) {
        return registry.byCode.get(code) || null;
    }

    /**
     * @public
     * @static
     * @param {number} id
     * @returns {StringTableOperation|null}
     */
    static parseById(id) {
        return registry.byId.get(id) || null;
    }

    /**
     * @public
     * @static
     * @returns {StringTableOperation}
     */
    static get CREATE() {
        return create;
    }

    /**
     * @public
     * @static
     * @returns {StringTableOperation}
     */
    static get UPDATE() {
        return update;
    }

    /**
     * @public
     * @static
     * @returns {StringTableOperation}
     */
    static get REMOVE() {
        return remove;
    }
}

const create = new StringTableOperation('CREATE', 0);
const update = new StringTableOperation('UPDATE', 1);
const remove = new StringTableOperation('REMOVE', 2);

export default StringTableOperation;

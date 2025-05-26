import Assert from './../../core/Assert.js';

const registry = {
    byCode: new Map(),
    byId: new Map()
};

class EntityOperation {
    constructor(code, id) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(Number.isInteger(id));

        this._code = code;
        this._id = id;

        registry.byCode.set(code, this);
        registry.byId.set(id, this);
    }

    /**
     * @returns {String}
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
     * @returns {EntityOperation}
     */
    static get UPDATE() {
        return update;
    }

    /**
     * @public
     * @static
     * @returns {EntityOperation}
     */
    static get LEAVE() {
        return leave;
    }

    /**
     * @public
     * @static
     * @returns {EntityOperation}
     */
    static get CREATE() {
        return create;
    }

    /**
     * @public
     * @static
     * @returns {EntityOperation}
     */
    static get DELETE() {
        return remove;
    }
}

const update = new EntityOperation('UPDATE', 0);
const leave = new EntityOperation('LEAVE', 1);
const create = new EntityOperation('CREATE', 2);
const remove = new EntityOperation('DELETE', 3);

export default EntityOperation;

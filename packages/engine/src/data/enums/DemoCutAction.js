import Assert from '../../core/Assert.js';

/** @type {Map<number, DemoCutAction>} */
const registry = new Map();

class DemoCutAction {
    /** @private @type {string} */
    _code;

    /** @private @type {number} */
    _id;

    /**
     * @constructor
     * @param {string} code
     * @param {number} id
     */
    constructor(code, id) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(Number.isInteger(id) && !registry.has(id));

        this._code = code;
        this._id = id;

        registry.set(id, this);
    }

    /**
     * @public
     * @static
     * @param {number} id
     * @returns {DemoCutAction|null}
     */
    static getById(id) {
        return registry.get(id) || null;
    }

    /**
     * @public
     * @returns {string}
     */
    get code() {
        return this._code;
    }

    /**
     * @public
     * @returns {number}
     */
    get id() {
        return this._id;
    }

    /**
     * The packet stays out of the cut.
     *
     * @public
     * @static
     * @returns {DemoCutAction}
     */
    static get DROP() {
        return drop;
    }

    /**
     * The packet goes into the cut as is.
     *
     * @public
     * @static
     * @returns {DemoCutAction}
     */
    static get KEEP() {
        return keep;
    }

    /**
     * The snapshot - DEM_FULL_PACKET.
     *
     * @public
     * @static
     * @returns {DemoCutAction}
     */
    static get SNAPSHOT() {
        return snapshot;
    }
}

const drop = new DemoCutAction('DROP', 0);
const keep = new DemoCutAction('KEEP', 1);
const snapshot = new DemoCutAction('SNAPSHOT', 2);

export default DemoCutAction;

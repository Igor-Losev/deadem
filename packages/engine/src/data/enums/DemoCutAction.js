import Assert from '../../core/Assert.js';

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
        Assert.isTrue(Number.isInteger(id));

        this._code = code;
        this._id = id;
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
}

const drop = new DemoCutAction('DROP', 0);
const keep = new DemoCutAction('KEEP', 1);

export default DemoCutAction;

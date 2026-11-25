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
     * String tables and state before the snapshot.
     *
     * @public
     * @static
     * @returns {DemoCutAction}
     */
    static get CATCH_UP() {
        return catchUp;
    }

    /**
     * Not in the cut.
     *
     * @public
     * @static
     * @returns {DemoCutAction}
     */
    static get DROP() {
        return drop;
    }

    /**
     * DEM_FileInfo with the length of the cut.
     *
     * @public
     * @static
     * @returns {DemoCutAction}
     */
    static get FILE_INFO() {
        return fileInfo;
    }

    /**
     * In the cut as is.
     *
     * @public
     * @static
     * @returns {DemoCutAction}
     */
    static get KEEP() {
        return keep;
    }

    /**
     * The full packet that starts the window.
     *
     * @public
     * @static
     * @returns {DemoCutAction}
     */
    static get SNAPSHOT() {
        return snapshot;
    }

    /**
     * Bootstrap DEM_StringTables rewritten to the state before the snapshot.
     *
     * @public
     * @static
     * @returns {DemoCutAction}
     */
    static get START_TABLES() {
        return startTables;
    }
}

const drop = new DemoCutAction('DROP', 0);
const keep = new DemoCutAction('KEEP', 1);
const snapshot = new DemoCutAction('SNAPSHOT', 2);
const catchUp = new DemoCutAction('CATCH_UP', 3);
const fileInfo = new DemoCutAction('FILE_INFO', 4);
const startTables = new DemoCutAction('START_TABLES', 5);

export default DemoCutAction;

const registry = {
    byCode: new Map(),
    byId: new Map()
};

class DemoSource {
    /**
     * @constructor
     * @param {string} code
     * @param {number} id 
     */
    constructor(code, id) {
        this._code = code;
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
     * @param {string} code 
     * @returns {DemoSource|null} 
     */
    static parse(code) {
        return registry.byCode.get(code) || null;
    }

    /**
     * @public
     * @param {number} id 
     * @returns {DemoSource|null} 
     */
    static parseById(id) {
        return registry.byId.get(id) || null;
    }

    /**
     * @public
     * @static
     * @returns {DemoSource} 
     */
    static get HTTP_BROADCAST() {
        return httpBroadcast;
    }

    /**
     * @public
     * @static
     * @returns {DemoSource} 
     */
    static get REPLAY() {
        return replay;
    }
}

const httpBroadcast = new DemoSource('HTTP_BROADCAST', 0);
const replay = new DemoSource('REPLAY', 1);

export default DemoSource;


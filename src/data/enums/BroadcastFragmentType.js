import Assert from '#core/Assert.js';

const registry = new Map();

class BroadcastFragmentType {
    /**
    * @constructor
    * @param {string} code
    * @param {string} endpoint
    */
    constructor(code, endpoint) {
        Assert.isTrue(typeof code === 'string');
        Assert.isTrue(typeof endpoint === 'string');

        this._code = code;
        this._endpoint = endpoint;

        registry.set(code, this);
    }

    /**
     * @returns {string} 
     */
    get code() {
        return this._code;
    }

    /**
     * @returns {string} 
     */
    get endpoint() {
        return this._endpoint;
    }

    /**
     * @static
     * @public
     * @returns {BroadcastFragmentType} 
     */
    static get DELTA() { return delta; }
    
    /**
     * @static
     * @public
     * @returns {BroadcastFragmentType} 
     */
    static get FULL() { return full; }
    
    /**
     * @static
     * @public
     * @returns {BroadcastFragmentType} 
     */
    static get START() { return start; }
}

const delta = new BroadcastFragmentType('DELTA', 'delta');
const full = new BroadcastFragmentType('FULL', 'full');
const start = new BroadcastFragmentType('START', 'start');

export default BroadcastFragmentType;


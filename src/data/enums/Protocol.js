import Assert from '#core/Assert.js';

const registry = new Map();

class Protocol {
   /**
    * @constructor
    * @param {String} code
    * @param {String} scheme
    */
    constructor(code, scheme) {
        Assert.isTrue(typeof code === 'string');
        Assert.isTrue(typeof scheme === 'string');

        this._code = code;
        this._scheme = scheme;

        registry.set(code, this);
    }

    /**
     * @returns {String} 
     */
    get code() {
        return this._code;
    }

    /**
     * @returns {String} 
     */
    get scheme() {
        return this._scheme;
    }

    /**
     * @static
     * @public
     * @returns {Protocol} 
     */
    static get HTTP() { return http; }

    /**
     * @static
     * @public
     * @returns {Protocol} 
     */
    static get HTTPS() { return https; }
}

const http = new Protocol('HTTP', 'http');
const https = new Protocol('HTTPS', 'https');

export default Protocol;


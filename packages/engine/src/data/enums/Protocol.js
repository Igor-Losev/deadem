import Assert from '#core/Assert.js';

const registry = new Map();

class Protocol {
    /**
    * @constructor
    * @param {string} code
    * @param {string} scheme
    */
    constructor(code, scheme) {
        Assert.isTrue(typeof code === 'string');
        Assert.isTrue(typeof scheme === 'string');

        this._code = code;
        this._scheme = scheme;

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

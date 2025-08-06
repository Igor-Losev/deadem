class DemoSource {
    /**
     * @constructor
     * @param {string} code
     */
    constructor(code) {
        this._code = code;
    }

    /**
     * @returns {string} 
     */
    get code() {
        return this._code;
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

const httpBroadcast = new DemoSource('HTTP_BROADCAST');
const replay = new DemoSource('REPLAY');

export default DemoSource;


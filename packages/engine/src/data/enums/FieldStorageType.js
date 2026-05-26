import Assert from '#core/Assert.js';

class FieldStorageType {
    /**
     * @public
     * @constructor
     * @param {String} code
     */
    constructor(code) {
        Assert.isTrue(typeof code === 'string');

        this._code = code;
    }

    /**
     * @public
     * @returns {string}
     */
    get code() {
        return this._code;
    }

    /**
     * Single 32-bit float.
     *
     * @public
     * @static
     * @returns {FieldStorageType}
     */
    static get FLOAT() {
        return float;
    }

    /**
     * Fixed-width float vector.
     *
     * @public
     * @static
     * @returns {FieldStorageType}
     */
    static get VECTOR() {
        return vector;
    }

    /**
     * 32-bit integer (signed, unsigned or boolean).
     *
     * @public
     * @static
     * @returns {FieldStorageType}
     */
    static get INT() {
        return int;
    }

    /**
     * Anything that does not fit a typed array (strings, BigInts).
     *
     * @public
     * @static
     * @returns {FieldStorageType}
     */
    static get MISC() {
        return misc;
    }
}

const float = new FieldStorageType('FLOAT');
const vector = new FieldStorageType('VECTOR');
const int = new FieldStorageType('INT');
const misc = new FieldStorageType('MISC');

export default FieldStorageType;

import Assert from '#core/Assert.js';

import FieldStorageType from '#data/enums/FieldStorageType.js';

/**
 * Describes how a decoded value is stored on an {@link Entity}: which typed-array
 * bucket ({@link FieldStorageType}), the vector width, and how a 32-bit integer is
 * read back (signed, unsigned or boolean).
 */
class FieldStorageDescriptor {
    /**
     * @public
     * @constructor
     * @param {FieldStorageType} type
     * @param {number} dim
     * @param {boolean} signed
     * @param {boolean} bool
     */
    constructor(type, dim, signed, bool) {
        Assert.isTrue(type instanceof FieldStorageType);
        Assert.isTrue(Number.isInteger(dim));
        Assert.isTrue(typeof signed === 'boolean');
        Assert.isTrue(typeof bool === 'boolean');

        this._type = type;
        this._dim = dim;
        this._signed = signed;
        this._bool = bool;
    }

    /**
     * @public
     * @returns {FieldStorageType}
     */
    get type() {
        return this._type;
    }

    /**
     * @public
     * @returns {number}
     */
    get dim() {
        return this._dim;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get signed() {
        return this._signed;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get bool() {
        return this._bool;
    }

    /**
     * @public
     * @static
     * @returns {FieldStorageDescriptor}
     */
    static get FLOAT() {
        return float;
    }

    /**
     * @public
     * @static
     * @returns {FieldStorageDescriptor}
     */
    static get INT_SIGNED() {
        return intSigned;
    }

    /**
     * @public
     * @static
     * @returns {FieldStorageDescriptor}
     */
    static get INT_UNSIGNED() {
        return intUnsigned;
    }

    /**
     * @public
     * @static
     * @returns {FieldStorageDescriptor}
     */
    static get INT_BOOL() {
        return intBool;
    }

    /**
     * @public
     * @static
     * @returns {FieldStorageDescriptor}
     */
    static get MISC() {
        return misc;
    }

    /**
     * @public
     * @static
     * @param {number} dimension
     * @returns {FieldStorageDescriptor}
     */
    static createVector(dimension) {
        const descriptor = vectors[dimension] || null;

        if (descriptor === null) {
            throw new Error(`Unsupported vector dimension [ ${dimension} ]`);
        }

        return descriptor;
    }
}

const float = new FieldStorageDescriptor(FieldStorageType.FLOAT, 1, false, false);
const intSigned = new FieldStorageDescriptor(FieldStorageType.INT, 1, true, false);
const intUnsigned = new FieldStorageDescriptor(FieldStorageType.INT, 1, false, false);
const intBool = new FieldStorageDescriptor(FieldStorageType.INT, 1, false, true);
const misc = new FieldStorageDescriptor(FieldStorageType.MISC, 0, false, false);

const vectors = [
    null,
    null,
    new FieldStorageDescriptor(FieldStorageType.VECTOR, 2, false, false),
    new FieldStorageDescriptor(FieldStorageType.VECTOR, 3, false, false),
    new FieldStorageDescriptor(FieldStorageType.VECTOR, 4, false, false)
];

export default FieldStorageDescriptor;

import FieldPath from './FieldPath.js';

const BITS_PER_ELEMENT = 16;
const BITS_PER_ELEMENT_BIG = BigInt(BITS_PER_ELEMENT);
const MASK = (1 << BITS_PER_ELEMENT) - 1;
const MASK_BIG = BigInt(MASK);
const MAX_LENGTH = 7;

const registryByCode = new Map();
const registryById = [ ];

/**
 * Constructs and caches unique {@link FieldPath} instances.
 * Ensures that no two FieldPath instances with identical
 * paths are duplicated. If a {@link FieldPath} with the same
 * values has already been created, it returns the existing instance.
 */
class FieldPathBuilder {
    /**
     * @public
     * @constructor
     */
    constructor() {
        this._path = [ -1 ];
    }

    /**
     * @public
     * @returns {number}
     */
    get length() {
        return this._path.length;
    }

    /**
     * Given a path builds an appropriate {@link FieldPath};
     *
     * @public
     * @static
     * @param {Array<number>} path
     * @returns {FieldPath}
     */
    static build(path) {
        const code = toCode(path);

        const existing = registryByCode.get(code);

        if (existing) {
            return existing;
        }

        const fieldPath = new FieldPath(path.slice(), code, registryById.length);

        registryByCode.set(code, fieldPath);
        registryById[fieldPath.id] = fieldPath;

        return fieldPath;
    }

    /**
     * Given a code of the {@link FieldPath} - reconstructs the instance.
     *
     * @public
     * @static
     * @param {BigInt} code
     * @returns {FieldPath}
     */
    static reconstruct(code) {
        const existing = registryByCode.get(code);

        if (existing) {
            return existing;
        }

        const path = fromCode(code);

        const fieldPath = new FieldPath(path, code, registryById.length);

        registryByCode.set(code, fieldPath);
        registryById[fieldPath.id] = fieldPath;

        return fieldPath;
    }

    /**
     * @public
     * @param {number} value
     * @param {number=} index
     */
    add(value, index = this._path.length - 1) {
        if (this._path.length === 0) {
            throw new Error(`Unable to add value [ ${value} ] - path is empty`);
        }

        if (index >= this._path.length) {
            throw new Error(`Unable to add value [ ${value} ] - index [ ${index} ] is bigger than path length [ ${this._path.length} ]`);
        }

        this._path[index] += value;
    }

    /**
     * @public
     * @returns {FieldPath}
     */
    build() {
        return FieldPathBuilder.build(this._path);
    }

    /**
     * @public
     * @param {number} count
     */
    drop(count) {
        if (count > this._path.length) {
            throw new Error(`Unable to drop [ ${count} ] items - path has only [ ${this._path.length} ] items`);
        }

        this._path.length -= count;
    }

    /**
     * @public
     * @param {number} value
     */
    push(value) {
        if (this.length >= MAX_LENGTH) {
            throw new Error(`Unable to push value [ ${value} ] - path is full`);
        }

        this._path.push(value);
    }

    /**
     * @public
     * @param {number} value
     * @param {number} index
     */
    set(value, index = this._path.length - 1) {
        this._path[index] = value;
    }
}

/**
 * @param {bigint} code
 * @returns {Array<number>}
 */
function fromCode(code) {
    const path = [ ];

    let remainder = code;

    const length = remainder & MASK_BIG;

    for (let i = 1; i <= length; i++) {
        remainder = remainder >> BITS_PER_ELEMENT_BIG;

        const value = remainder & MASK_BIG;

        path.push(Number(value));
    }

    return path;
}

/**
 * @param {Array<number>} path
 * @returns {bigint}
 */
function toCode(path) {
    let code = 0n;

    for (let i = path.length - 1; i >= 0; i--) {
        code = (code << BITS_PER_ELEMENT_BIG) | BigInt(path[i]);
    }

    code = (code << BITS_PER_ELEMENT_BIG) | BigInt(path.length);

    return code;
}

export default FieldPathBuilder;

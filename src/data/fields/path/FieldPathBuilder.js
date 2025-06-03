import FieldPath from './FieldPath.js';

const MAX_LENGTH = 7;

const registry = new Map();

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
     * @public
     * @static
     * @param {Array<number>} path
     * @returns {FieldPath}
     */
    static build(path) {
        const cacheKey = getCacheKey(path);

        const existing = registry.get(cacheKey);

        if (existing) {
            return existing;
        }

        const fieldPath = new FieldPath(path.slice());

        registry.set(cacheKey, fieldPath);

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

function getCacheKey(path) {
    let key = BigInt(path.length) << 16n;

    for (let i = 0; i < path.length; i++) {
        key = (key << 16n) | BigInt(path[i]);
    }

    return key;
}

export default FieldPathBuilder;

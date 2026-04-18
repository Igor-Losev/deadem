import FieldPath from './FieldPath.js';

const BITS_PER_ELEMENT = 16;
const BITS_PER_ELEMENT_BIG = BigInt(BITS_PER_ELEMENT);
const MASK = (1 << BITS_PER_ELEMENT) - 1;
const MASK_BIG = BigInt(MASK);
const MAX_LENGTH = 7;

/**
 * Unified cache for {@link FieldPath} instances.
 *
 * byCode    — BigInt code → FieldPath (all paths)
 * byId      — numeric id → FieldPath (all paths)
 * bySingle  — path[0] → FieldPath (length-1 fast lookup)
 * byPair    — (path[0] + path[1] * 0x10000) → FieldPath (length-2 fast lookup)
 */
const cache = {
    byCode: new Map(),
    byId: [ ],
    bySingle: [ ],
    byPair: new Map()
};

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
        if (path.length === 1) {
            const existing = cache.bySingle[path[0]];

            if (existing !== undefined) {
                return existing;
            }

            return createAndCache(path);
        }

        if (path.length === 2) {
            const key = toPairKey(path[0], path[1]);
            const existing = cache.byPair.get(key);

            if (existing !== undefined) {
                return existing;
            }

            return createAndCache(path);
        }

        const code = toCode(path);
        const existing = cache.byCode.get(code);

        if (existing) {
            return existing;
        }

        return createAndCache(path);
    }

    /**
     * Given a code of the {@link FieldPath} - reconstructs the instance.
     * Accepts either a BigInt code or a Number transferCode.
     *
     * @public
     * @static
     * @param {BigInt|number} code
     * @returns {FieldPath}
     */
    static reconstruct(code) {
        if (typeof code === 'number') {
            return reconstructFromTransferCode(code);
        }

        const existing = cache.byCode.get(code);

        if (existing) {
            return existing;
        }

        const path = fromCode(code);

        return createAndCache(path);
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
     */
    reset() {
        this._path.length = 1;
        this._path[0] = -1;
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
 * @param {number} p0
 * @param {number} p1
 * @returns {number}
 */
function toPairKey(p0, p1) {
    return p0 + p1 * 0x10000;
}

/**
 * Creates a new FieldPath and registers it in all caches.
 *
 * @param {Array<number>} path
 * @returns {FieldPath}
 */
function createAndCache(path) {
    const code = toCode(path);
    const fieldPath = new FieldPath(path.slice(), code, cache.byId.length);

    cache.byCode.set(code, fieldPath);
    cache.byId[fieldPath.id] = fieldPath;

    if (path.length === 1) {
        cache.bySingle[path[0]] = fieldPath;
    } else if (path.length === 2) {
        cache.byPair.set(toPairKey(path[0], path[1]), fieldPath);
    }

    return fieldPath;
}

/**
 * Reconstructs a FieldPath from a Number-encoded transferCode.
 *
 * @param {number} transferCode
 * @returns {FieldPath}
 */
function reconstructFromTransferCode(transferCode) {
    const { length, p0, p1 } = FieldPath.decodeTransferCode(transferCode);

    if (length === 1) {
        const existing = cache.bySingle[p0];

        if (existing !== undefined) {
            return existing;
        }

        return FieldPathBuilder.build([ p0 ]);
    }

    const key = toPairKey(p0, p1);
    const existing = cache.byPair.get(key);

    if (existing !== undefined) {
        return existing;
    }

    return FieldPathBuilder.build([ p0, p1 ]);
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

import FieldPath from './FieldPath.js';

const BITS_PER_ELEMENT = 16;
const BITS_PER_ELEMENT_BIG = BigInt(BITS_PER_ELEMENT);
const MASK = (1 << BITS_PER_ELEMENT) - 1;
const MASK_BIG = BigInt(MASK);
const MAX_LENGTH = 7;

const cache = {
    byCode: new Map(),
    byId: [ ],
    bySingle: [ ],
    byPair: new Map()
};

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
     * Returns the cached {@link FieldPath} for the given path, creating it on miss.
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
            const existing = cache.byPair.get(toPairKey(path[0], path[1]));

            if (existing !== undefined) {
                return existing;
            }

            return createAndCache(path);
        }

        const existing = cache.byCode.get(toCode(path));

        if (existing !== undefined) {
            return existing;
        }

        return createAndCache(path);
    }

    /**
     * Returns the cached {@link FieldPath} with the given id.
     *
     * @public
     * @static
     * @param {number} id
     * @returns {FieldPath}
     */
    static getById(id) {
        return cache.byId[id];
    }

    /**
     * Reconstructs a {@link FieldPath} from a BigInt code or a Number transferCode.
     *
     * @public
     * @static
     * @param {BigInt|number} code
     * @returns {FieldPath}
     */
    static reconstruct(code) {
        if (typeof code === 'number') {
            const { length, p0, p1 } = FieldPath.decodeTransferCode(code);

            if (length === 1) {
                const existing = cache.bySingle[p0];

                if (existing !== undefined) {
                    return existing;
                }

                return FieldPathBuilder.build([ p0 ]);
            }

            const existing = cache.byPair.get(toPairKey(p0, p1));

            if (existing !== undefined) {
                return existing;
            }

            return FieldPathBuilder.build([ p0, p1 ]);
        }

        const existing = cache.byCode.get(code);

        if (existing !== undefined) {
            return existing;
        }

        return createAndCache(fromCode(code));
    }

    /**
     * Increments the value at the given index.
     *
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
     * Builds the {@link FieldPath} from the current state.
     *
     * @public
     * @returns {FieldPath}
     */
    build() {
        return FieldPathBuilder.build(this._path);
    }

    /**
     * Drops the last `count` elements.
     *
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
     * Appends a value to the path.
     *
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
     * Resets the builder to its initial state.
     *
     * @public
     */
    reset() {
        this._path.length = 1;
        this._path[0] = -1;
    }

    /**
     * Sets the value at the given index.
     *
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
 * @param {bigint} code
 * @returns {Array<number>}
 */
function fromCode(code) {
    const path = [ ];

    let remainder = code;

    const length = remainder & MASK_BIG;

    for (let i = 1; i <= length; i++) {
        remainder = remainder >> BITS_PER_ELEMENT_BIG;

        path.push(Number(remainder & MASK_BIG));
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

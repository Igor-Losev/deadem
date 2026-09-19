/** @import FieldPath from './FieldPath.js' */

import FieldPathTrie from './FieldPathTrie.js';

const MAX_LENGTH = 7;

/** @type {Array<FieldPath>} */
const paths = [ ];

const root = new FieldPathTrie();
const initial = root.descend(-1);

/**
 * Builds {@link FieldPath} instances over a trie of every path ever seen.
 */
class FieldPathBuilder {
    /**
     * @public
     * @constructor
     */
    constructor() {
        this._node = initial;
    }

    /**
     * @public
     * @returns {number}
     */
    get length() {
        return this._node.depth;
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
        return register(root.reach(path));
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
        return paths[id];
    }

    /**
     * Increments the value at the given index.
     *
     * @public
     * @param {number} value
     * @param {number=} index
     */
    add(value, index) {
        const last = this._node.depth - 1;

        if (last < 0) {
            throw new Error(`Unable to add value [ ${value} ] - path is empty`);
        }

        if (index === undefined || index === last) {
            this._node = this._node.parent.descend(this._node.value + value);

            return;
        }

        if (index > last) {
            throw new Error(`Unable to add value [ ${value} ] - index [ ${index} ] is bigger than path length [ ${this._node.depth} ]`);
        }

        const path = this._node.toPath();

        path[index] += value;

        this._node = root.reach(path);
    }

    /**
     * Builds the {@link FieldPath} from the current state.
     *
     * @public
     * @returns {FieldPath}
     */
    build() {
        return this._node.fieldPath !== null ? this._node.fieldPath : register(this._node);
    }

    /**
     * Drops the last `count` elements.
     *
     * @public
     * @param {number} count
     */
    drop(count) {
        if (count > this._node.depth) {
            throw new Error(`Unable to drop [ ${count} ] items - path has only [ ${this._node.depth} ] items`);
        }

        for (let i = 0; i < count; i++) {
            this._node = this._node.parent;
        }
    }

    /**
     * Appends a value to the path.
     *
     * @public
     * @param {number} value
     */
    push(value) {
        if (this._node.depth >= MAX_LENGTH) {
            throw new Error(`Unable to push value [ ${value} ] - path is full`);
        }

        this._node = this._node.descend(value);
    }

    /**
     * Resets the builder to its initial state.
     *
     * @public
     */
    reset() {
        this._node = initial;
    }

    /**
     * Sets the value at the given index.
     *
     * @public
     * @param {number} value
     * @param {number=} index
     */
    set(value, index) {
        if (index === undefined || index === this._node.depth - 1) {
            this._node = this._node.parent.descend(value);

            return;
        }

        const path = this._node.toPath();

        path[index] = value;

        this._node = root.reach(path);
    }
}

/**
 * @param {FieldPathTrie} node
 * @returns {FieldPath}
 */
function register(node) {
    if (node.fieldPath !== null) {
        return node.fieldPath;
    }

    const fieldPath = node.resolve(paths.length);

    paths.push(fieldPath);

    return fieldPath;
}

export default FieldPathBuilder;

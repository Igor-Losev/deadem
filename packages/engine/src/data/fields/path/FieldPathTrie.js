import FieldPath from './FieldPath.js';

const INDEX_OFFSET = 1; // Path starts from -1

const VALUE_MINIMUM = -1;
const VALUE_MAXIMUM = (1 << 16) - 1;

class FieldPathTrie {
    /**
     * @public
     * @constructor
     * @param {FieldPathTrie|null} [parent=null]
     * @param {number} [depth=0]
     * @param {number} [value=0]
     */
    constructor(parent = null, depth = 0, value = 0) {
        /** @type {Array<FieldPathTrie>} */
        this.children = [ ];

        /** @type {FieldPath|null} */
        this._fieldPath = null;

        this.depth = depth;
        this.parent = /** @type {FieldPathTrie} */ (parent === null ? this : parent);
        this.value = value;
    }

    /**
     * @public
     * @returns {FieldPath|null}
     */
    get fieldPath() {
        return this._fieldPath;
    }

    /**
     * Returns the child standing for the given value, creating it on miss.
     *
     * @public
     * @param {number} value
     * @returns {FieldPathTrie}
     */
    descend(value) {
        if (value < VALUE_MINIMUM || value > VALUE_MAXIMUM) {
            throw new Error(`Unable to descend into value [ ${value} ] - out of range [ ${VALUE_MINIMUM} .. ${VALUE_MAXIMUM} ]`);
        }

        const index = value + INDEX_OFFSET;

        let next = this.children[index];

        if (next === undefined) {
            next = new FieldPathTrie(this, this.depth + 1, value);

            this.children[index] = next;
        }

        return next;
    }

    /**
     * Returns the node standing for the given path, creating the missing ones.
     *
     * @public
     * @param {Array<number>} path
     * @returns {FieldPathTrie}
     */
    reach(path) {
        /** @type {FieldPathTrie} */
        let node = this;

        for (let i = 0; i < path.length; i++) {
            node = node.descend(path[i]);
        }

        return node;
    }

    /**
     * Returns the {@link FieldPath} this node stands for, creating it with the given id on miss.
     *
     * @public
     * @param {number} id
     * @returns {FieldPath}
     */
    resolve(id) {
        if (this._fieldPath === null) {
            this._fieldPath = new FieldPath(this.toPath(), id);
        }

        return this._fieldPath;
    }

    /**
     * Restores the path this node stands for.
     *
     * @public
     * @returns {Array<number>}
     */
    toPath() {
        const path = new Array(this.depth);

        /** @type {FieldPathTrie} */
        let node = this;

        for (let i = this.depth - 1; i >= 0; i--) {
            path[i] = node.value;

            node = node.parent;
        }

        return path;
    }
}

export default FieldPathTrie;

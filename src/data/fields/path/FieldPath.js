class FieldPath {
    /**
     * @public
     * @constructor
     * @param {Array<Number>} path
     */
    constructor(path) {
        this._path = path;
    }

    /**
     * @public
     * @returns {Array<Number>}
     */
    get path() {
        return this._path;
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
     * @param {number} index
     * @returns {number}
     */
    get(index) {
        if (index >= this._path.length) {
            throw new Error(`Unable to get path - index [ ${index} ] is out of bounds [ ${this._path.length} ]`);
        }

        return this._path[index];
    }

    /**
     * @public
     * @returns {string}
     */
    toString() {
        return this._path.join('|');
    }
}

export default FieldPath;

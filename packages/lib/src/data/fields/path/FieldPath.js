/**
 * TransferCode — Number-encoded representation for cross-thread transfer.
 * Avoids BigInt structured clone overhead for short paths.
 *
 * Layout (fits in float64, up to 48 useful bits):
 *   Bits [0..15]  : path length (1 or 2)
 *   Bits [16..31] : path[0]
 *   Bits [32..47] : path[1] (length 2 only)
 *
 * Paths with length >= 3 fall back to BigInt code.
 */
const SHIFT_P0 = 0x10000;
const SHIFT_P1 = 0x100000000;
const MASK_16 = 0xFFFF;

class FieldPath {
    /**
     * @public
     * @constructor
     * @param {Array<Number>} path
     * @param {BigInt} code
     * @param {number} id
     */
    constructor(path, code, id) {
        this._path = path;
        this._code = code;
        this._id = id;

        const len = path.length;

        if (len === 1) {
            this._transferCode = path[0] * SHIFT_P0 + 1;
        } else if (len === 2) {
            this._transferCode = path[1] * SHIFT_P1 + path[0] * SHIFT_P0 + 2;
        } else {
            this._transferCode = code;
        }
    }

    /**
     * Decodes a Number-encoded transferCode back into path components.
     *
     * @public
     * @static
     * @param {number} transferCode
     * @returns {{ length: number, p0: number, p1: number }}
     */
    static decodeTransferCode(transferCode) {
        const length = transferCode & MASK_16;
        const p0 = (transferCode / SHIFT_P0 | 0) & MASK_16;
        const p1 = (transferCode / SHIFT_P1) | 0;

        return { length, p0, p1 };
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
     * @returns {BigInt}
     */
    get code() {
        return this._code;
    }

    /**
     * @public
     * @returns {number}
     */
    get id() {
        return this._id;
    }

    /**
     * @public
     * @returns {number}
     */
    get length() {
        return this._path.length;
    }

    /**
     * Number-encoded code for efficient cross-thread transfer.
     * Number for length 1-2 paths, BigInt for longer.
     *
     * @public
     * @returns {number|BigInt}
     */
    get transferCode() {
        return this._transferCode;
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

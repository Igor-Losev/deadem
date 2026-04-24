import Assert from '#core/Assert.js';

import StringTableType from '#data/enums/StringTableType.js';

class StringTableEntry {
    /**
     * @public
     * @constructor
     * @param {StringTableType} type
     * @param {number} id
     * @param {String} key
     * @param {Buffer|null|*} value
     */
    constructor(type, id, key, value) {
        Assert.isTrue(type instanceof StringTableType);
        Assert.isTrue(Number.isInteger(id));
        Assert.isTrue(typeof key === 'string');

        this._type = type;
        this._id = id;
        this._key = key;
        this._value = value;
    }

    /**
     * @returns {StringTableType}
     */
    get type() {
        return this._type;
    }

    /**
     * @returns {number}
     */
    get id() {
        return this._id;
    }

    /**
     * @returns {String}
     */
    get key() {
        return this._key;
    }

    /**
     * @returns {Buffer|null|*}
     */
    get value() {
        return this._value;
    }

    /**
     * @public
     * @static
     * @param {protobuf.Type|null} decoder
     * @param {Buffer|Uint8Array|null} buffer
     * @param {StringTableType} type
     * @param {number} id
     * @param {String} key
     */
    static fromBuffer(decoder, buffer, type, id, key) {
        if (buffer === null) {
            return new StringTableEntry(type, id, key, null);
        }

        const value = decoder ? decoder.decode(buffer) : buffer;

        return new StringTableEntry(type, id, key, value);
    }
}

export default StringTableEntry;

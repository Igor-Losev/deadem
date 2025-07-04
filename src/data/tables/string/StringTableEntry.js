import Assert from '#core/Assert.js';

import ProtoProvider from '#providers/ProtoProvider.instance.js';

import StringTableType from '#data/enums/StringTableType.js';

const CModifierTableEntry = ProtoProvider.BASE_MODIFIER.lookupType('CModifierTableEntry');
const CMsgPlayerInfo = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CMsgPlayerInfo');

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

    get type() {
        return this._type;
    }

    get id() {
        return this._id;
    }

    get key() {
        return this._key;
    }

    get value() {
        return this._value;
    }

    /**
     * @public
     * @static
     * @param {Buffer|Uint8Array|null} buffer
     * @param {StringTableType} type
     * @param {number} id
     * @param {String} key
     */
    static fromBuffer(buffer, type, id, key) {
        if (buffer === null) {
            return new StringTableEntry(type, id, key, null);
        }

        let value;

        switch (type) {
            case StringTableType.ACTIVE_MODIFIERS:
                value = CModifierTableEntry.decode(buffer);

                break;
            case StringTableType.USER_INFO:
                value = CMsgPlayerInfo.decode(buffer);

                break;
            default:
                value = buffer;

                break;
        }

        return new StringTableEntry(type, id, key, value);
    }
}

export default StringTableEntry;

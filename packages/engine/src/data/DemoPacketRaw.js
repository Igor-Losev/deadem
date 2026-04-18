import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import DemoSource from '#data/enums/DemoSource.js';

class DemoPacketRaw {
    /**
     * @public
     * @constructor
     *
     * @param {number} sequence
     * @param {VarInt32} type
     * @param {DemoSource} source
     * @param {VarInt32} tick
     * @param {VarInt32} frame
     * @param {Buffer|Uint8Array} payload
     */
    constructor(sequence, type, source, tick, frame, payload) {
        this._sequence = sequence;
        this._ordinal = sequence;
        this._type = type;
        this._source = source;
        this._tick = tick;
        this._frame = frame;
        this._payload = payload;
    }

    /**
     * @public
     * @returns {number}
     */
    get sequence() {
        return this._sequence;
    }

    /**
     * @public
     * @returns {number}
     */
    get ordinal() {
        return this._ordinal;
    }

    /**
     * @public
     * @param {number} value
     */
    set ordinal(value) {
        this._ordinal = value;
    }

    /**
     * @public
     * @returns {VarInt32}
     */
    get type() {
        return this._type;
    }

    /**
     * @public
     * @returns {DemoSource} 
     */
    get source() {
        return this._source;
    }

    /**
     * @public
     * @returns {VarInt32}
     */
    get tick() {
        return this._tick;
    }

    /**
     * @public
     * @returns {VarInt32}
     */
    get frame() {
        return this._frame;
    }

    /**
     * @public
     * @returns {Buffer|Uint8Array}
     */
    get payload() {
        return this._payload;
    }

    /**
     * Determines whether this is a bootstrap packet (initial + bootstrap type).
     *
     * @public
     * @returns {boolean}
     */
    getIsBootstrap() {
        const type = this.getType();

        return this.getIsInitial() && type !== null && type.bootstrap;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsCompressed() {
        return (this._type.value & 64) === 64;
    }
 
    /**
     * Determines whether this is an initial packet (tick === -1).
     *
     * @public
     * @returns {boolean}
     */
    getIsInitial() {
        return this._tick.value === -1;
    }

    /**
     * @public
     * @returns {number}
     */
    getSize() {
        return this._type.size + this._tick.size + this._frame.size + this._payload.length;
    }

    /**
     * @public
     * @returns {DemoPacketType|null} 
     */
    getType() {
        return DemoPacketType.parseById(this.getTypeId());
    }

    /**
     * @public
     * @returns {number}
     */
    getTypeId() {
        return getTypeId.call(this);
    }

    /**
     * Decompresses and decodes the protobuf payload.
     *
     * @public
     * @returns {*|null}
     */
    decode() {
        const demoPacketType = this.getType();

        if (demoPacketType === null) {
            return null;
        }

        let decompressed;

        if (this.getIsCompressed()) {
            decompressed = SnappyDecompressor.decompress(this._payload);
        } else {
            decompressed = this._payload;
        }

        let decoded;

        if (this._source === DemoSource.HTTP_BROADCAST && (demoPacketType.heavy || demoPacketType === DemoPacketType.DEM_SPAWN_GROUPS)) {
            if (demoPacketType === DemoPacketType.DEM_FULL_PACKET) {
                throw new Error('Unhandled [ DEM_FULL_PACKET ] packet for source [ HTTP_BROADCAST ]');
            }

            decoded = { data: decompressed };
        } else {
            decoded = demoPacketType.proto.decode(decompressed);
        }

        return decoded;
    }
}

function getTypeId() {
    return this._type.value & ~64;
}

export default DemoPacketRaw;


import Assert from '#core/Assert.js';
import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';

import MessagePacket from '#data/MessagePacket.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import MessagePacketType from '#data/enums/MessagePacketType.js';

import MessagePacketRawExtractor from '#extractors/MessagePacketRawExtractor.js';

class DemoPacket {
    /**
     * @public
     * @constructor
     *
     * @param {number} sequence
     * @param {DemoPacketType} type
     * @param {number} tick
     * @param {*} data
     */
    constructor(sequence, type, tick, data) {
        Assert.isTrue(type instanceof DemoPacketType);
        Assert.isTrue(Number.isInteger(tick));

        this._sequence = sequence;
        this._type = type;
        this._tick = tick;
        this._data = data;
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
     * @returns {DemoPacketType}
     */
    get type() {
        return this._type;
    }

    /**
     * @public
     * @returns {number}
     */
    get tick() {
        return this._tick;
    }

    /**
     * @public
     * @returns {*}
     */
    get data() {
        return this._data;
    }

    /**
     * @static
     * @public
     * @param {DemoPacketObject} object
     * @returns {DemoPacket}
     */
    static fromObject(object) {
        return new DemoPacket(
            object.sequence,
            DemoPacketType.parse(object.type),
            object.tick,
            object.data
        );
    }

    /**
     * @static
     * @public
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {DemoPacket|null}
     */
    static parse(demoPacketRaw) {
        const demoPacketType = DemoPacketType.parseById(demoPacketRaw.getTypeId());

        if (demoPacketType === null) {
            return null;
        }

        let data;

        if (demoPacketRaw.getIsCompressed()) {
            data = SnappyDecompressor.decompress(demoPacketRaw.payload);
        } else {
            data = demoPacketRaw.payload;
        }

        const decoded = demoPacketType.proto.decode(data);

        switch (demoPacketType) {
            case DemoPacketType.DEM_PACKET:
            case DemoPacketType.DEM_SIGNON_PACKET: {
                const messagePacketsRaw = new MessagePacketRawExtractor(decoded.data).all();
                const messagePackets = messagePacketsRaw.map(messagePacketRaw => MessagePacket.parse(messagePacketRaw));

                sort(messagePackets);

                return new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoPacketRaw.tick.value, messagePackets);
            }
            case DemoPacketType.DEM_FULL_PACKET: {
                const messagePacketsRaw = new MessagePacketRawExtractor(decoded.packet.data).all();
                const messagePackets = messagePacketsRaw.map(messagePacketRaw => MessagePacket.parse(messagePacketRaw));

                sort(messagePackets);

                return new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoPacketRaw.tick.value, {
                    messagePackets,
                    stringTables: decoded.stringTable
                });
            }
            default: {
                return new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoPacketRaw.tick.value, decoded);
            }
        }
    }

    /**
     * Determines whether this is the initial packet at the start of the demo.
     *
     * In Source 2 demos, the initial packet typically contains the baseline state
     * of the world or entities before any updates occur.
     *
     * @public
     * @returns {boolean} `true` if this is the initial demo packet (tick === -1).
     */
    getIsInitial() {
        return this._tick === -1;
    }

    /**
     * @public
     * @returns {DemoPacketObject}
     */
    toObject() {
        return {
            sequence: this._sequence,
            type: this._type.code,
            tick: this._tick,
            data: this._data
        };
    }
}

/**
 * @typedef {{sequence: number, type: String, tick: number, data: *}} DemoPacketObject
 */

/**
 * @param {Array<MessagePacket>} messagePackets
 */
function sort(messagePackets) {
    messagePackets.sort((a, b) => {
        const priorityA = getPacketPriority(a.type);
        const priorityB = getPacketPriority(b.type);

        return priorityB - priorityA;
    });
}

/**
 * @param {MessagePacketType} type
 * @returns {number}
 */
function getPacketPriority(type) {
    switch (type) {
        case MessagePacketType.NET_TICK:
            return 100;
        case MessagePacketType.SVC_CREATE_STRING_TABLE:
        case MessagePacketType.SVC_UPDATE_STRING_TABLE:
        case MessagePacketType.NET_SPAWN_GROUP_LOAD:
            return 10;
        case MessagePacketType.SVC_PACKET_ENTITIES:
            return -10;
        case MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT:
            return -100;
        default:
            return 0;
    }
}

export default DemoPacket;

import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import { describe, expect, test } from 'vitest';

import Snappy from '../src/core/Snappy.instance.js';

import DemoPacket from '../src/data/DemoPacket.js';
import DemoPacketRaw from '../src/data/DemoPacketRaw.js';
import MessagePacket from '../src/data/MessagePacket.js';
import MessagePacketRaw from '../src/data/MessagePacketRaw.js';
import VarInt32 from '../src/data/VarInt32.js';
import DemoPacketType from '../src/data/enums/DemoPacketType.js';
import DemoSource from '../src/data/enums/DemoSource.js';
import MessagePacketType from '../src/data/enums/MessagePacketType.js';

import MessagePacketRawExtractor from '../src/extractors/MessagePacketRawExtractor.js';

import PacketCodec from '../src/schema/PacketCodec.js';
import SchemaRegistry from '../src/schema/SchemaRegistry.js';

import MessagePacketRawWriter from '../src/writers/MessagePacketRawWriter.js';

import createDescriptors from './support/createDescriptors.js';

const FILE_INFO = DemoPacketType.DEM_FILE_INFO.id;
const FULL_PACKET = DemoPacketType.DEM_FULL_PACKET.id;
const PACKET = DemoPacketType.DEM_PACKET.id;

/**
 * Field 9, varint 7: the schema does not know it.
 */
const UNKNOWN_FIELD = [ 0x48, 0x07 ];

const registry = new SchemaRegistry(createDescriptors({
    CDemoFileInfo: [
        [ 'playback_time', 1, 'float' ],
        [ 'playback_ticks', 2, 'int32' ],
        [ 'playback_frames', 3, 'int32' ]
    ],
    CDemoFullPacket: [
        [ 'packet', 2, 'CDemoPacket' ]
    ],
    CDemoPacket: [
        [ 'data', 3, 'bytes' ]
    ],
    CDemoSpawnGroups: [
        [ 'msgs', 3, 'bytes', true ]
    ],
    CNETMsg_Tick: [
        [ 'tick', 1, 'uint32' ]
    ]
}));

registry.registerDemoType(DemoPacketType.DEM_FILE_INFO);
registry.registerDemoType(DemoPacketType.DEM_FULL_PACKET);
registry.registerDemoType(DemoPacketType.DEM_PACKET);
registry.registerDemoType(DemoPacketType.DEM_SPAWN_GROUPS);
registry.registerMessageType(MessagePacketType.NET_TICK);

const codec = new PacketCodec(registry);
const descriptor = registry.getDescriptor('CDemoFileInfo');

/**
 * @param {number} typeId
 * @param {Uint8Array} payload
 * @param {boolean} [compressed=false]
 * @param {DemoSource} [source=DemoSource.REPLAY]
 * @returns {DemoPacketRaw}
 */
function createRaw(typeId, payload, compressed = false, source = DemoSource.REPLAY) {
    const type = compressed ? typeId | DemoPacketRaw.COMPRESSED_FLAG : typeId;
    const body = compressed ? Snappy.compress(payload) : payload;

    return new DemoPacketRaw(5, new VarInt32(type), source, new VarInt32(4), new VarInt32(body.length), body);
}

/**
 * @param {number} ticks
 * @returns {Uint8Array}
 */
function encodeFileInfo(ticks) {
    return toBinary(descriptor, create(descriptor, { playbackFrames: ticks, playbackTicks: ticks, playbackTime: ticks / 64 }));
}

/**
 * @param {Array<number>} types
 * @returns {Uint8Array}
 */
function encodeMessages(types) {
    return new MessagePacketRawWriter(types.map(type => new MessagePacketRaw(type, 1, Uint8Array.from([ type ])))).all();
}

/**
 * @param {*} fileInfo
 */
function setFiveTicks(fileInfo) {
    fileInfo.playbackTicks = 5;
}

/**
 * @param {Array<number>} types
 * @returns {DemoPacketRaw}
 */
function createFullPacket(types) {
    const fullPacketDescriptor = registry.getDescriptor('CDemoFullPacket');

    return createRaw(FULL_PACKET, toBinary(fullPacketDescriptor, create(fullPacketDescriptor, { packet: { data: encodeMessages(types) } })), true);
}

describe('PacketCodec', () => {
    describe('compressDemoPacket()', () => {
        test('It should compress the known fields and drop the ones the schema does not know', () => {
            const parsed = codec.parseDemoPacketRaw(createRaw(FILE_INFO, Uint8Array.from([ ...encodeFileInfo(4), ...UNKNOWN_FIELD ])));

            expect(parsed).not.toBeNull();

            parsed.ordinal = 9;

            const compressed = codec.compressDemoPacket(/** @type {DemoPacket} */ (parsed));
            const payload = Snappy.decompress(compressed.payload);

            expect(compressed.getIsCompressed()).toBe(true);
            expect(compressed.getTypeId()).toBe(FILE_INFO);
            expect(compressed.source).toBe(DemoSource.REPLAY);
            expect([ compressed.sequence, compressed.tick.value, compressed.ordinal ]).toEqual([ 5, 4, 9 ]);
            expect(Array.from(payload)).toEqual(Array.from(encodeFileInfo(4)));
        });

        test('It should re-encode a parsed message and copy a raw one', () => {
            const tickDescriptor = registry.getDescriptor('CNETMsg_Tick');
            const tickPayload = toBinary(tickDescriptor, create(tickDescriptor, { tick: 4 }));
            const packetDescriptor = registry.getDescriptor('CDemoPacket');
            const messageBytes = new MessagePacketRawWriter([
                new MessagePacketRaw(MessagePacketType.NET_TICK.id, tickPayload.length, tickPayload),
                new MessagePacketRaw(99, 1, Uint8Array.from([ 7 ]))
            ]).all();
            const parsed = codec.parseDemoPacketRaw(createRaw(PACKET, toBinary(packetDescriptor, create(packetDescriptor, { data: messageBytes }))));

            expect(parsed).not.toBeNull();
            expect(/** @type {DemoPacket} */ (parsed).data.messagePackets[0]).toBeInstanceOf(MessagePacket);

            const compressed = codec.compressDemoPacket(/** @type {DemoPacket} */ (parsed));
            const body = fromBinary(packetDescriptor, Snappy.decompress(compressed.payload));
            const messages = new MessagePacketRawExtractor(/** @type {*} */ (body).data).all();

            expect(compressed.getIsCompressed()).toBe(true);
            expect(compressed.getTypeId()).toBe(PACKET);
            expect(messages.map(message => message.type)).toEqual([ MessagePacketType.NET_TICK.id, 99 ]);
            expect(fromBinary(tickDescriptor, messages[0].payload)).toMatchObject({ tick: 4 });
            expect(Array.from(messages[1].payload)).toEqual([ 7 ]);
        });

        test('It should wrap a full packet in packet.data', () => {
            const demoPacket = new DemoPacket(5, DemoPacketType.DEM_FULL_PACKET, 4, {
                messagePackets: [ new MessagePacketRaw(MessagePacketType.NET_TICK.id, 1, Uint8Array.from([ 9 ])) ],
                stringTables: null
            });
            const raw = codec.compressDemoPacket(demoPacket);
            const full = fromBinary(registry.getDescriptor('CDemoFullPacket'), Snappy.decompress(raw.payload));
            const messages = new MessagePacketRawExtractor(/** @type {*} */ (full).packet.data).all();

            expect(raw.getTypeId()).toBe(FULL_PACKET);
            expect(messages.map(message => [ message.type, Array.from(message.payload) ])).toEqual([ [ MessagePacketType.NET_TICK.id, [ 9 ] ] ]);
        });
    });

    describe('copyDemoPacketRaw()', () => {
        test('It should take the packet of a full packet as an uncompressed DEM_Packet with the messages the filter keeps', () => {
            const types = [ MessagePacketType.SVC_PACKET_ENTITIES.id, MessagePacketType.SVC_USER_COMMAND_KEYFRAME.id, MessagePacketType.NET_TICK.id ];
            const packet = codec.copyDemoPacketRaw(createFullPacket(types), type => type !== MessagePacketType.SVC_USER_COMMAND_KEYFRAME.id);
            const messagePacketsRaw = new MessagePacketRawExtractor(/** @type {*} */ (fromBinary(registry.getDescriptor('CDemoPacket'), packet.payload)).data).all();

            expect([ packet.getTypeId(), packet.getIsCompressed(), packet.tick.value, packet.sequence ]).toEqual([ PACKET, false, 4, 5 ]);
            expect(messagePacketsRaw.map(messagePacketRaw => messagePacketRaw.type)).toEqual([ MessagePacketType.SVC_PACKET_ENTITIES.id, MessagePacketType.NET_TICK.id ]);
        });

        test('It should keep every message without a filter', () => {
            const types = [ MessagePacketType.SVC_PACKET_ENTITIES.id, MessagePacketType.SVC_USER_COMMAND_KEYFRAME.id, MessagePacketType.NET_TICK.id ];
            const packet = codec.copyDemoPacketRaw(createFullPacket(types));
            const messagePacketsRaw = new MessagePacketRawExtractor(/** @type {*} */ (fromBinary(registry.getDescriptor('CDemoPacket'), packet.payload)).data).all();

            expect(messagePacketsRaw.map(messagePacketRaw => messagePacketRaw.type)).toEqual(types);
        });
    });

    describe('decodeDemoPacketRaw()', () => {
        test('It should read the messages of a broadcast DEM_Packet without CDemoPacket around them', () => {
            const tickDescriptor = registry.getDescriptor('CNETMsg_Tick');
            const tickPayload = toBinary(tickDescriptor, create(tickDescriptor, { tick: 4 }));
            const messageBytes = new MessagePacketRawWriter([ new MessagePacketRaw(MessagePacketType.NET_TICK.id, tickPayload.length, tickPayload) ]).all();
            const demoPacket = codec.decodeDemoPacketRaw(createRaw(PACKET, messageBytes, true, DemoSource.HTTP_BROADCAST));
            const messagePacket = /** @type {*} */ (demoPacket).data.messagePackets[0];

            expect(messagePacket).toBeInstanceOf(MessagePacket);
            expect(messagePacket.data.tick).toBe(4);
        });

        test('It should keep the payload of a broadcast DEM_SpawnGroups as bytes', () => {
            const payload = Uint8Array.from([ 0, 98, 88 ]);
            const demoPacket = codec.decodeDemoPacketRaw(createRaw(DemoPacketType.DEM_SPAWN_GROUPS.id, payload, false, DemoSource.HTTP_BROADCAST));

            expect(/** @type {*} */ (demoPacket).data).toEqual({ data: payload });
        });
    });

    describe('editDemoPacketRaw()', () => {
        test('It should keep the fields the schema does not know', () => {
            const edited = codec.editDemoPacketRaw(createRaw(FILE_INFO, Uint8Array.from([ ...encodeFileInfo(4), ...UNKNOWN_FIELD ])), setFiveTicks);

            expect(Array.from(edited.payload.subarray(-UNKNOWN_FIELD.length))).toEqual(UNKNOWN_FIELD);
            expect(fromBinary(descriptor, edited.payload)).toMatchObject({ playbackFrames: 4, playbackTicks: 5 });
        });

        test('It should write the edited payload uncompressed', () => {
            const edited = codec.editDemoPacketRaw(createRaw(FILE_INFO, encodeFileInfo(4), true), setFiveTicks);

            expect(edited.getIsCompressed()).toBe(false);
            expect(edited.getTypeId()).toBe(FILE_INFO);
            expect(fromBinary(descriptor, edited.payload)).toMatchObject({ playbackFrames: 4, playbackTicks: 5 });
        });
    });

    describe('parseStringTables()', () => {
        test('It should return null when the packet is not a full packet', () => {
            expect(codec.parseStringTables(createRaw(FILE_INFO, encodeFileInfo(4)))).toBeNull();
        });
    });
});

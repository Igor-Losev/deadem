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
 * @param {DemoPacketRaw} raw
 * @returns {Uint8Array}
 */
function readPayload(raw) {
    return raw.getIsCompressed() ? Snappy.decompress(raw.payload) : raw.payload;
}

describe('PacketCodec', () => {
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

    describe('encodeDemoPacket()', () => {
        test('It should encode the known fields and drop the ones the schema does not know', () => {
            const parsed = codec.decodeDemoPacketRaw(createRaw(FILE_INFO, Uint8Array.from([ ...encodeFileInfo(4), ...UNKNOWN_FIELD ])));

            expect(parsed).not.toBeNull();

            parsed.ordinal = 9;

            const encoded = codec.encodeDemoPacket(/** @type {DemoPacket} */ (parsed));

            expect(encoded.getTypeId()).toBe(FILE_INFO);
            expect(encoded.source).toBe(DemoSource.REPLAY);
            expect([ encoded.sequence, encoded.tick.value, encoded.ordinal ]).toEqual([ 5, 4, 9 ]);
            expect(Array.from(readPayload(encoded))).toEqual(Array.from(encodeFileInfo(4)));
        });

        test('It should re-encode a parsed message and copy a raw one', () => {
            const tickDescriptor = registry.getDescriptor('CNETMsg_Tick');
            const tickPayload = toBinary(tickDescriptor, create(tickDescriptor, { tick: 4 }));
            const packetDescriptor = registry.getDescriptor('CDemoPacket');
            const messageBytes = new MessagePacketRawWriter([
                new MessagePacketRaw(MessagePacketType.NET_TICK.id, tickPayload.length, tickPayload),
                new MessagePacketRaw(99, 1, Uint8Array.from([ 7 ]))
            ]).all();
            const parsed = codec.decodeDemoPacketRaw(createRaw(PACKET, toBinary(packetDescriptor, create(packetDescriptor, { data: messageBytes }))));

            expect(parsed).not.toBeNull();
            expect(/** @type {DemoPacket} */ (parsed).data.messagePackets[0]).toBeInstanceOf(MessagePacket);

            const encoded = codec.encodeDemoPacket(/** @type {DemoPacket} */ (parsed));
            const body = fromBinary(packetDescriptor, readPayload(encoded));
            const messages = new MessagePacketRawExtractor(/** @type {*} */ (body).data).all();

            expect(encoded.getTypeId()).toBe(PACKET);
            expect(messages.map(message => message.type)).toEqual([ MessagePacketType.NET_TICK.id, 99 ]);
            expect(fromBinary(tickDescriptor, messages[0].payload)).toMatchObject({ tick: 4 });
            expect(Array.from(messages[1].payload)).toEqual([ 7 ]);
        });

        test('It should wrap a full packet in packet.data', () => {
            const demoPacket = new DemoPacket(5, DemoPacketType.DEM_FULL_PACKET, 4, {
                messagePackets: [ new MessagePacketRaw(MessagePacketType.NET_TICK.id, 1, Uint8Array.from([ 9 ])) ],
                stringTables: null
            });
            const raw = codec.encodeDemoPacket(demoPacket);
            const full = fromBinary(registry.getDescriptor('CDemoFullPacket'), readPayload(raw));
            const messages = new MessagePacketRawExtractor(/** @type {*} */ (full).packet.data).all();

            expect(raw.getTypeId()).toBe(FULL_PACKET);
            expect(messages.map(message => [ message.type, Array.from(message.payload) ])).toEqual([ [ MessagePacketType.NET_TICK.id, [ 9 ] ] ]);
        });
    });

    describe('repackDemoPacketRaw()', () => {
        test('It should write back the fields the schema does not know', () => {
            const raw = createRaw(FILE_INFO, Uint8Array.from([ ...encodeFileInfo(4), ...UNKNOWN_FIELD ]));
            const fileInfo = codec.unpackDemoPacketRaw(raw);

            fileInfo.playbackTicks = 5;

            const payload = readPayload(codec.repackDemoPacketRaw(raw, fileInfo));

            expect(Array.from(payload.subarray(-UNKNOWN_FIELD.length))).toEqual(UNKNOWN_FIELD);
            expect(fromBinary(descriptor, payload)).toMatchObject({ playbackFrames: 4, playbackTicks: 5 });
        });

        test('It should keep the type, sequence and tick of the packet', () => {
            const raw = createRaw(FILE_INFO, encodeFileInfo(4), true);
            const repacked = codec.repackDemoPacketRaw(raw, codec.unpackDemoPacketRaw(raw));

            expect([ repacked.getTypeId(), repacked.sequence, repacked.tick.value ]).toEqual([ FILE_INFO, 5, 4 ]);
            expect(Array.from(readPayload(repacked))).toEqual(Array.from(encodeFileInfo(4)));
        });

        test('It should refuse a message of another type than the packet', () => {
            const raw = createRaw(FILE_INFO, encodeFileInfo(4));

            expect(() => codec.repackDemoPacketRaw(raw, create(registry.getDescriptor('CDemoPacket'), { }))).toThrow('another type');
        });

        test('It should refuse a broadcast packet', () => {
            const raw = createRaw(FILE_INFO, encodeFileInfo(4), false, DemoSource.HTTP_BROADCAST);

            expect(() => codec.repackDemoPacketRaw(raw, create(descriptor, { }))).toThrow('broadcast is not supported');
        });
    });

    describe('unpackDemoPacketRaw()', () => {
        test('It should refuse a broadcast packet', () => {
            const raw = createRaw(FILE_INFO, encodeFileInfo(4), false, DemoSource.HTTP_BROADCAST);

            expect(() => codec.unpackDemoPacketRaw(raw)).toThrow('broadcast is not supported');
        });
    });
});

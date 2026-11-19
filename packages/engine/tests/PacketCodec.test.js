import { create, fromBinary, toBinary } from '@bufbuild/protobuf';
import { describe, expect, test } from 'vitest';

import Snappy from '../src/core/Snappy.instance.js';

import DemoPacketRaw from '../src/data/DemoPacketRaw.js';
import VarInt32 from '../src/data/VarInt32.js';
import DemoPacketType from '../src/data/enums/DemoPacketType.js';
import DemoSource from '../src/data/enums/DemoSource.js';

import PacketCodec from '../src/schema/PacketCodec.js';
import SchemaRegistry from '../src/schema/SchemaRegistry.js';

import createDescriptors from './support/createDescriptors.js';

const FILE_INFO = DemoPacketType.DEM_FILE_INFO.id;

/**
 * Field 9, varint 7: the schema does not know it.
 */
const UNKNOWN_FIELD = [ 0x48, 0x07 ];

const registry = new SchemaRegistry(createDescriptors({
    CDemoFileInfo: [
        [ 'playback_time', 1, 'float' ],
        [ 'playback_ticks', 2, 'int32' ],
        [ 'playback_frames', 3, 'int32' ]
    ]
}));

registry.registerDemoType(DemoPacketType.DEM_FILE_INFO);

const codec = new PacketCodec(registry);
const descriptor = registry.getDescriptor('CDemoFileInfo');

/**
 * @param {Uint8Array} payload
 * @param {boolean} [compressed=false]
 * @returns {DemoPacketRaw}
 */
function createFileInfo(payload, compressed = false) {
    const type = compressed ? FILE_INFO | DemoPacketRaw.COMPRESSED_FLAG : FILE_INFO;
    const body = compressed ? Snappy.compress(payload) : payload;

    return new DemoPacketRaw(0, new VarInt32(type, 1), DemoSource.REPLAY, new VarInt32(4, 1), new VarInt32(body.length, 1), body);
}

/**
 * @param {number} ticks
 * @returns {Uint8Array}
 */
function encodeFileInfo(ticks) {
    return toBinary(descriptor, create(descriptor, { playbackFrames: ticks, playbackTicks: ticks, playbackTime: ticks / 64 }));
}

/**
 * @param {*} fileInfo
 */
function setFiveTicks(fileInfo) {
    fileInfo.playbackTicks = 5;
}

describe('PacketCodec', () => {
    describe('editRaw()', () => {
        test('It should keep the fields the schema does not know', () => {
            const edited = codec.editRaw(createFileInfo(Uint8Array.from([ ...encodeFileInfo(4), ...UNKNOWN_FIELD ])), setFiveTicks);

            expect(Array.from(edited.payload.subarray(-UNKNOWN_FIELD.length))).toEqual(UNKNOWN_FIELD);
            expect(fromBinary(descriptor, edited.payload)).toMatchObject({ playbackFrames: 4, playbackTicks: 5 });
        });

        test('It should write the edited payload uncompressed', () => {
            const edited = codec.editRaw(createFileInfo(encodeFileInfo(4), true), setFiveTicks);

            expect(edited.getIsCompressed()).toBe(false);
            expect(edited.getTypeId()).toBe(FILE_INFO);
            expect(fromBinary(descriptor, edited.payload)).toMatchObject({ playbackFrames: 4, playbackTicks: 5 });
        });
    });
});

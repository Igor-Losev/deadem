import { create, toBinary } from '@bufbuild/protobuf';
import { describe, expect, test } from 'vitest';

import ProtoDecoder from '../src/core/proto/ProtoDecoder.js';

import UserCommand from '../src/data/UserCommand.js';

import createDescriptors from './support/createDescriptors.js';

function createDescriptorsForTest() {
    return createDescriptors({
        TestAngle: [
            [ 'x', 1, 'float' ],
            [ 'y', 2, 'float' ]
        ],
        TestEnvelope: [
            [ 'tick', 1, 'int32' ],
            [ 'angle', 2, 'TestAngle' ],
            [ 'big', 3, 'uint64' ],
            [ 'tags', 4, 'string', true ],
            [ 'crc', 5, 'bytes' ]
        ],
        TestContract: [
            [ 'tick', 1, 'int32' ],
            [ 'active', 2, 'bool' ],
            [ 'big', 3, 'uint64' ],
            [ 'ratio', 4, 'float' ],
            [ 'note', 5, 'string' ],
            [ 'crc', 6, 'bytes' ]
        ]
    });
}

/**
 * @param {string} typeName
 * @param {Record<string, *>} values
 * @returns {{ decoder: ProtoDecoder, data: Uint8Array }}
 */
function encode(typeName, values) {
    const schema = /** @type {*} */ (createDescriptorsForTest().getMessage(typeName));

    return { decoder: ProtoDecoder.fromDescriptor(schema), data: toBinary(schema, create(schema, values)) };
}

describe('UserCommand', () => {
    test('It should decode nested messages and read uint64 as bigint', () => {
        const crc = new Uint8Array([ 1, 2, 3 ]);
        const { decoder, data } = encode('TestEnvelope', { tick: 7, angle: { x: 1.5, y: -2.5 }, big: 42n, tags: [ 'left', 'right' ], crc });

        const command = UserCommand.fromData(0, 1, data, decoder);

        expect(command.state).toEqual({ tick: 7, angle: { x: 1.5, y: -2.5 }, big: 42n, tags: [ 'left', 'right' ], crc });
    });

    test('It should apply a delta in place, keeping .state a live reference', () => {
        const { decoder, data } = encode('TestEnvelope', { tick: 1, angle: { x: 0, y: 0 }, tags: [] });
        const command = UserCommand.fromData(0, 1, data, decoder);
        const state = command.state;

        command.applyDelta(2, new Uint8Array([ 0x08, 0x02 ]));

        expect(command.state).toBe(state);
        expect(command.state.tick).toBe(2);
    });

    test('It should represent a field the same way from a keyframe or a delta', () => {
        const { decoder, data } = encode('TestContract', { tick: 5, active: true, big: 300n, ratio: 1.5, note: 'hi', crc: new Uint8Array([ 1, 2, 3 ]) });

        const keyframe = UserCommand.fromData(0, 1, data, decoder);
        const delta = new UserCommand(0, 1, { }, decoder);

        delta.applyDelta(2, new Uint8Array([
            0x08, 0x05,
            0x10, 0x01,
            0x18, 0xac, 0x02,
            0x25, 0x00, 0x00, 0xc0, 0x3f,
            0x2a, 0x02, 0x68, 0x69,
            0x32, 0x03, 0x01, 0x02, 0x03
        ]));

        expect(delta.state).toEqual(keyframe.state);
    });

    test('It should reject a non-plain-object state', () => {
        const { decoder } = encode('TestEnvelope', { });

        expect(() => new UserCommand(0, 1, null, decoder)).toThrow();
        expect(() => new UserCommand(0, 1, 'nope', decoder)).toThrow();
        expect(() => new UserCommand(0, 1, [], decoder)).toThrow();
    });
});

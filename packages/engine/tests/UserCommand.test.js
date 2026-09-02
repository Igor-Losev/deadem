import protobuf from 'protobufjs';
import { describe, expect, test } from 'vitest';

import UserCommand from '#data/UserCommand.js';

function createEnvelopeType() {
    const root = new protobuf.Root();

    const angle = new protobuf.Type('TestAngle');

    angle.add(new protobuf.Field('x', 1, 'float'));
    angle.add(new protobuf.Field('y', 2, 'float'));

    const envelope = new protobuf.Type('TestEnvelope');

    envelope.add(new protobuf.Field('tick', 1, 'int32'));
    envelope.add(new protobuf.Field('angle', 2, 'TestAngle'));
    envelope.add(new protobuf.Field('big', 3, 'uint64'));
    envelope.add(new protobuf.Field('tags', 4, 'string', 'repeated'));
    envelope.add(new protobuf.Field('crc', 5, 'bytes'));

    root.add(angle);
    root.add(envelope);
    root.resolveAll();

    return envelope;
}

describe('UserCommand', () => {
    test('It should extract a nested state tree, coercing uint64 to a string', () => {
        const type = createEnvelopeType();
        const crc = new Uint8Array([ 1, 2, 3 ]);
        const data = type.encode({ tick: 7, angle: { x: 1.5, y: -2.5 }, big: 42, tags: [ 'left', 'right' ], crc }).finish();

        const command = UserCommand.fromData(0, 1, data, type);

        expect(command.state).toEqual({ tick: 7, angle: { x: 1.5, y: -2.5 }, big: '42', tags: [ 'left', 'right' ], crc });
    });

    test('It should apply a delta in place, keeping .state a live reference', () => {
        const type = createEnvelopeType();
        const command = UserCommand.fromData(0, 1, type.encode({ tick: 1, angle: { x: 0, y: 0 }, tags: [] }).finish(), type);
        const state = command.state;

        command.applyDelta(2, new Uint8Array([ 0x08, 0x02 ]));

        expect(command.state).toBe(state);
        expect(command.state.tick).toBe(2);
    });

    test('It should represent a field the same way from a keyframe or a delta', () => {
        const root = new protobuf.Root();
        const type = new protobuf.Type('TestContract');

        type.add(new protobuf.Field('tick', 1, 'int32'));
        type.add(new protobuf.Field('active', 2, 'bool'));
        type.add(new protobuf.Field('big', 3, 'uint64'));
        type.add(new protobuf.Field('ratio', 4, 'float'));
        type.add(new protobuf.Field('note', 5, 'string'));
        type.add(new protobuf.Field('crc', 6, 'bytes'));

        root.add(type);
        root.resolveAll();

        const values = { tick: 5, active: true, big: 300, ratio: 1.5, note: 'hi', crc: new Uint8Array([ 1, 2, 3 ]) };

        const keyframe = UserCommand.fromData(0, 1, type.encode(values).finish(), type);
        const delta = new UserCommand(0, 1, { }, type);

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
        const type = createEnvelopeType();

        expect(() => new UserCommand(0, 1, null, type)).toThrow();
        expect(() => new UserCommand(0, 1, 'nope', type)).toThrow();
        expect(() => new UserCommand(0, 1, [], type)).toThrow();
    });
});

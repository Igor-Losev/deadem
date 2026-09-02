import protobuf from 'protobufjs';
import { describe, expect, test } from 'vitest';

import DeltaExtractor from '#extractors/DeltaExtractor.js';

function createStateType() {
    const root = new protobuf.Root();

    const buttons = new protobuf.Type('TestButtons');

    buttons.add(new protobuf.Field('press', 1, 'uint32'));
    buttons.add(new protobuf.Field('hold', 2, 'uint32'));

    const entry = new protobuf.Type('TestEntry');

    entry.add(new protobuf.Field('value', 1, 'int32'));
    entry.add(new protobuf.Field('tag', 2, 'int32'));

    const state = new protobuf.Type('TestState');

    state.add(new protobuf.Field('tick', 1, 'int32'));
    state.add(new protobuf.Field('active', 2, 'bool'));
    state.add(new protobuf.Field('slot', 3, 'int32', 'optional', undefined, { default: -1 }));
    state.add(new protobuf.Field('ratio', 4, 'float'));
    state.add(new protobuf.Field('big', 5, 'uint64'));
    state.add(new protobuf.Field('buttons', 6, 'TestButtons'));
    state.add(new protobuf.Field('entries', 8, 'TestEntry', 'repeated'));
    state.add(new protobuf.Field('nums', 9, 'int32', 'repeated'));
    state.add(new protobuf.Field('precise', 10, 'double'));
    state.add(new protobuf.Field('signed', 11, 'sint32'));

    root.add(buttons);
    root.add(entry);
    root.add(state);
    root.resolveAll();

    return state;
}

describe('DeltaExtractor', () => {
    test('It should set present fields and carry forward absent ones', () => {
        const type = createStateType();
        const state = {};

        new DeltaExtractor(new Uint8Array([ 0x08, 0x05, 0x10, 0x01, 0x25, 0x00, 0x00, 0xc0, 0x3f, 0x28, 0xac, 0x02 ]), type).merge(state);

        expect(state).toEqual({ tick: 5, active: true, ratio: 1.5, big: '300' });

        new DeltaExtractor(new Uint8Array([ 0x08, 0x09 ]), type).merge(state);

        expect(state).toEqual({ tick: 9, active: true, ratio: 1.5, big: '300' });
    });

    test('It should restore the declared default on wire-7 for a scalar field', () => {
        const type = createStateType();
        const state = { slot: 42 };

        new DeltaExtractor(new Uint8Array([ 0x1f ]), type).merge(state);

        expect(state.slot).toBe(-1);
    });

    test('It should delete a message field and empty a repeated one on wire-7', () => {
        const type = createStateType();
        const state = { buttons: { press: 1, hold: 2 }, entries: [ { value: 1 } ] };

        new DeltaExtractor(new Uint8Array([ 0x37 ]), type).merge(state);

        expect(state).not.toHaveProperty('buttons');

        new DeltaExtractor(new Uint8Array([ 0x47 ]), type).merge(state);

        expect(state.entries).toEqual([]);
    });

    test('It should merge into an existing nested message', () => {
        const type = createStateType();
        const state = { buttons: { press: 1, hold: 9 } };

        new DeltaExtractor(new Uint8Array([ 0x32, 0x02, 0x08, 0x07 ]), type).merge(state);

        expect(state.buttons).toEqual({ press: 7, hold: 9 });
    });

    test('It should carry forward repeated indices absent from the wire', () => {
        const type = createStateType();
        const state = { entries: [ { value: 100 }, { value: 200 }, { value: 300 } ] };

        new DeltaExtractor(new Uint8Array([ 0x42, 0x09, 0x1f, 0x02, 0x02, 0x08, 0x0a, 0x12, 0x02, 0x08, 0x1e ]), type).merge(state);

        expect(state.entries).toEqual([ { value: 10 }, { value: 200 }, { value: 30 } ]);
    });

    test('It should merge a repeated element over its previous value', () => {
        const type = createStateType();
        const state = { entries: [ { value: 100, tag: 1 } ] };

        new DeltaExtractor(new Uint8Array([ 0x42, 0x04, 0x02, 0x02, 0x10, 0x07 ]), type).merge(state);

        expect(state.entries).toEqual([ { value: 100, tag: 7 } ]);
    });

    test('It should throw on an unknown wire type and a repeated scalar wire', () => {
        const type = createStateType();

        expect(() => new DeltaExtractor(new Uint8Array([ 0x0b ]), type).merge({})).toThrow('wire type [ 3 ]');
        expect(() => new DeltaExtractor(new Uint8Array([ 0x40, 0x01 ]), type).merge({})).toThrow('repeated field [ entries ] via scalar wire type [ 0 ]');
    });

    test('It should decode a negative int32 and a uint64 past 2^53', () => {
        const type = createStateType();
        const state = {};

        new DeltaExtractor(new Uint8Array([ 0x08, 0xfa, 0xf5, 0xff, 0xff, 0x0f ]), type).merge(state);

        expect(state.tick).toBe(-1286);

        new DeltaExtractor(new Uint8Array([ 0x28, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f ]), type).merge(state);

        expect(state.big).toBe('9223372036854775807');
    });

    test('It should throw on a repeated scalar, a double and an unknown varint', () => {
        const type = createStateType();

        expect(() => new DeltaExtractor(new Uint8Array([ 0x4a, 0x02, 0x05, 0x0a ]), type).merge({})).toThrow('repeated scalar field [ nums ]');
        expect(() => new DeltaExtractor(new Uint8Array([ 0x51, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]), type).merge({})).toThrow('double field [ precise ]');
        expect(() => new DeltaExtractor(new Uint8Array([ 0x58, 0x02 ]), type).merge({})).toThrow('varint type [ sint32 ]');
    });
});

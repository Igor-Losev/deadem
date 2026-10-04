import { describe, expect, test } from 'vitest';

import ProtoDecoder from '../src/core/proto/ProtoDecoder.js';

import DeltaExtractor from '../src/extractors/DeltaExtractor.js';

import createDescriptors from './support/createDescriptors.js';

function createStateDecoder() {
    const descriptors = createDescriptors({
        TestButtons: [
            [ 'press', 1, 'uint32' ],
            [ 'hold', 2, 'uint32' ]
        ],
        TestEntry: [
            [ 'value', 1, 'int32' ],
            [ 'tag', 2, 'int32' ]
        ],
        TestState: [
            [ 'tick', 1, 'int32' ],
            [ 'active', 2, 'bool' ],
            [ 'slot', 3, 'int32', false, '-1' ],
            [ 'ratio', 4, 'float' ],
            [ 'big', 5, 'uint64' ],
            [ 'buttons', 6, 'TestButtons' ],
            [ 'entries', 8, 'TestEntry', true ],
            [ 'nums', 9, 'int32', true ],
            [ 'precise', 10, 'double' ],
            [ 'signed', 11, 'sint32' ]
        ]
    });

    return ProtoDecoder.fromDescriptor(/** @type {*} */ (descriptors.getMessage('TestState')));
}

describe('DeltaExtractor', () => {
    test('It should set present fields and carry forward absent ones', () => {
        const decoder = createStateDecoder();
        const state = {};

        new DeltaExtractor(new Uint8Array([ 0x08, 0x05, 0x10, 0x01, 0x25, 0x00, 0x00, 0xc0, 0x3f, 0x28, 0xac, 0x02 ]), decoder).merge(state);

        expect(state).toEqual({ tick: 5, active: true, ratio: 1.5, big: 300n });

        new DeltaExtractor(new Uint8Array([ 0x08, 0x09 ]), decoder).merge(state);

        expect(state).toEqual({ tick: 9, active: true, ratio: 1.5, big: 300n });
    });

    test('It should restore the declared default on wire-7 for a scalar field', () => {
        const decoder = createStateDecoder();
        const state = { slot: 42 };

        new DeltaExtractor(new Uint8Array([ 0x1f ]), decoder).merge(state);

        expect(state.slot).toBe(-1);
    });

    test('It should delete a message field and empty a repeated one on wire-7', () => {
        const decoder = createStateDecoder();
        const state = { buttons: { press: 1, hold: 2 }, entries: [ { value: 1 } ] };

        new DeltaExtractor(new Uint8Array([ 0x37 ]), decoder).merge(state);

        expect(state).not.toHaveProperty('buttons');

        new DeltaExtractor(new Uint8Array([ 0x47 ]), decoder).merge(state);

        expect(state.entries).toEqual([]);
    });

    test('It should merge into an existing nested message', () => {
        const decoder = createStateDecoder();
        const state = { buttons: { press: 1, hold: 9 } };

        new DeltaExtractor(new Uint8Array([ 0x32, 0x02, 0x08, 0x07 ]), decoder).merge(state);

        expect(state.buttons).toEqual({ press: 7, hold: 9 });
    });

    test('It should carry forward repeated indices absent from the wire', () => {
        const decoder = createStateDecoder();
        const state = { entries: [ { value: 100 }, { value: 200 }, { value: 300 } ] };

        new DeltaExtractor(new Uint8Array([ 0x42, 0x09, 0x1f, 0x02, 0x02, 0x08, 0x0a, 0x12, 0x02, 0x08, 0x1e ]), decoder).merge(state);

        expect(state.entries).toEqual([ { value: 10 }, { value: 200 }, { value: 30 } ]);
    });

    test('It should merge a repeated element over its previous value', () => {
        const decoder = createStateDecoder();
        const state = { entries: [ { value: 100, tag: 1 } ] };

        new DeltaExtractor(new Uint8Array([ 0x42, 0x04, 0x02, 0x02, 0x10, 0x07 ]), decoder).merge(state);

        expect(state.entries).toEqual([ { value: 100, tag: 7 } ]);
    });

    test('It should decode negative int32, sint32 and large uint64 values', () => {
        const decoder = createStateDecoder();
        const state = {};

        new DeltaExtractor(new Uint8Array([ 0x08, 0xfa, 0xf5, 0xff, 0xff, 0x0f, 0x58, 0x03 ]), decoder).merge(state);

        expect(state.tick).toBe(-1286);
        expect(state.signed).toBe(-2);

        new DeltaExtractor(new Uint8Array([ 0x28, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x7f ]), decoder).merge(state);

        expect(state.big).toBe(9223372036854775807n);
    });

    test('It should throw on a wrong wire type, a repeated scalar and a double', () => {
        const decoder = createStateDecoder();

        expect(() => new DeltaExtractor(new Uint8Array([ 0x0b ]), decoder).merge({})).toThrow('wire type [ 3 ] for field [ tick ]');
        expect(() => new DeltaExtractor(new Uint8Array([ 0x40, 0x01 ]), decoder).merge({})).toThrow('wire type [ 0 ] for field [ entries ]');
        expect(() => new DeltaExtractor(new Uint8Array([ 0x4a, 0x02, 0x05, 0x0a ]), decoder).merge({})).toThrow('wire type [ 2 ] for field [ nums ]');
        expect(() => new DeltaExtractor(new Uint8Array([ 0x51, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 ]), decoder).merge({})).toThrow('wire type [ 1 ] for field [ precise ]');
    });
});

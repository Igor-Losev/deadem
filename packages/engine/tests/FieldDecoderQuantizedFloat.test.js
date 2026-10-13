import { describe, expect, test } from 'vitest';

import BitBuffer from '../src/core/BitBuffer.js';

import FieldDecoderInstructions from '../src/data/fields/decoding/FieldDecoderInstructions.js';
import FieldDecoderQuantizedFloat from '../src/data/fields/decoding/FieldDecoderQuantizedFloat.js';

describe('FieldDecoderQuantizedFloat.quantize()', () => {
    describe('When [ bitCount, low, high, flags ] set to [ 8, 0, 1, 0 ]', () => {
        const instructions = new FieldDecoderInstructions(null, 0, 8, 0, 1);

        const decoder = new FieldDecoderQuantizedFloat(instructions);

        test('It should return ~0.5 for 0.5', () => {
            expect(decoder.quantize(0.5)).toBeCloseTo(0.5, 2);
        });

        test('It should return 0 for 0', () => {
            expect(decoder.quantize(0)).toBe(0);
        });

        test('It should return 1 for 1', () => {
            expect(decoder.quantize(1)).toBe(1);
        });

        test('It should throw for 1.1 (high value reached)', () => {
            expect(() => decoder.quantize(1.1)).toThrowError();
        });

        test('It should throw for -0.1 (low value reached)', () => {
            expect(() => decoder.quantize(-0.1)).toThrowError();
        });
    });
});

describe('FieldDecoderQuantizedFloat.decode()', () => {
    describe('When bitCount is 32', () => {
        test('It should decode the payload as an unscaled float32', () => {
            const bytes = new Uint8Array(4);
            const view = new DataView(bytes.buffer);

            view.setFloat32(0, 850.125, true);

            const instructions = new FieldDecoderInstructions(null, 0, 32, 0, 0);
            const decoder = new FieldDecoderQuantizedFloat(instructions);

            expect(decoder.decode(new BitBuffer(bytes))).toBe(850.125);
        });
    });

    describe('When [ bitCount, low, high, flags ] set to [ 10, 0, 102.3, 2 ]', () => {
        test('It should not read a round-up bit, since the high value quantizes exactly', () => {
            const instructions = new FieldDecoderInstructions(null, 2, 10, 0, Math.fround(102.3));
            const decoder = new FieldDecoderQuantizedFloat(instructions);

            expect(decoder.decode(new BitBuffer(new Uint8Array([ 1, 0 ])))).toBeCloseTo(0.1998, 4);
        });
    });

    describe('When [ bitCount, low, high, flags ] set to [ 2, 0, 100, 8 ]', () => {
        test('It should widen the bit count to encode integers exactly', () => {
            const instructions = new FieldDecoderInstructions(null, 8, 2, 0, 100);
            const decoder = new FieldDecoderQuantizedFloat(instructions);

            expect(decoder.decode(new BitBuffer(new Uint8Array([ 200 ])))).toBe(100);
        });
    });

    describe('When [ bitCount, low, high, flags ] set to [ 8, 0, 1, -8 ]', () => {
        test('It should decode the high integer exactly', () => {
            const instructions = new FieldDecoderInstructions(null, -8, 8, 0, 1);
            const decoder = new FieldDecoderQuantizedFloat(instructions);

            expect(decoder.decode(new BitBuffer(new Uint8Array([ 128 ])))).toBe(1);
        });
    });
});

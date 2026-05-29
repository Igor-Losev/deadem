import { describe, expect, test } from 'vitest';

import BitBuffer from '#core/BitBuffer.js';

import FieldDecoderInstructions from '#data/fields/decoding/FieldDecoderInstructions.js';
import FieldDecoderQuantizedFloat from '#data/fields/decoding/FieldDecoderQuantizedFloat.js';

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
});

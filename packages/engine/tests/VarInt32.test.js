import { describe, expect, test } from 'vitest';

import BitWriter from '../src/core/BitWriter.js';

import VarInt32 from '../src/data/VarInt32.js';

describe('VarInt32.getSize()', () => {
    describe('When the value is on a byte boundary of the encoding', () => {
        test.each([
            [ 0, 1 ],
            [ 127, 1 ],
            [ 128, 2 ],
            [ 16383, 2 ],
            [ 16384, 3 ],
            [ 2097151, 3 ],
            [ 2097152, 4 ],
            [ 268435455, 4 ],
            [ 268435456, 5 ],
            [ 0xFFFFFFFF, 5 ]
        ])('It should match the encoded size of [ %i ]', (value, size) => {
            const writer = new BitWriter(VarInt32.MAXIMUM_SIZE_BYTES);

            writer.writeUVarInt32(value);

            expect(VarInt32.getSize(value)).toBe(size);
            expect(writer.getBuffer().length).toBe(size);
        });
    });

    describe('When the value is negative', () => {
        test('It should take five bytes', () => {
            expect(VarInt32.getSize(-1)).toBe(5);
        });
    });

    describe('When the value is not a 32-bit integer', () => {
        test.each([ 1.5, NaN, 2 ** 32, -(2 ** 31) - 1 ])('It should throw on [ %s ]', (value) => {
            expect(() => VarInt32.getSize(value)).toThrow();
        });
    });
});

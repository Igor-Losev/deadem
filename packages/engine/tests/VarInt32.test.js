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

describe('VarInt32.parse()', () => {
    describe('When the buffer holds the whole value', () => {
        test.each([
            [ 'a one-byte value', [ 0x07 ], 7, 1 ],
            [ 'only the first value', [ 0x07, 0xFF ], 7, 1 ],
            [ 'a value padded to two bytes', [ 0x87, 0x00 ], 7, 2 ],
            [ 'the tick -1', [ 0xFF, 0xFF, 0xFF, 0xFF, 0x0F ], -1, 5 ],
            [ 'no more than five bytes', [ 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x01 ], -1, 5 ]
        ])('It should read %s', (_, bytes, value, size) => {
            const varInt = VarInt32.parse(Uint8Array.from(bytes));

            expect([ varInt?.value, varInt?.size ]).toEqual([ value, size ]);
        });
    });

    describe('When the buffer ends inside the value', () => {
        test.each([
            [ 'an empty buffer', [ ] ],
            [ 'a buffer cut after one byte', [ 0x80 ] ],
            [ 'a buffer cut after four bytes', [ 0xFF, 0xFF, 0xFF, 0xFF ] ]
        ])('It should return null for %s', (_, bytes) => {
            expect(VarInt32.parse(Uint8Array.from(bytes))).toBeNull();
        });
    });
});

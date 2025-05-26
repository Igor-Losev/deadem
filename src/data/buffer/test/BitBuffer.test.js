import { describe, expect, test } from 'vitest';

import BitBuffer from './../BitBuffer.js';

describe('BitBuffer.read()', () => {
    describe('When reading chunks [ 6, 4, 3, 1, 2 ] from [ 0x51, 0x85 ]', () => {
        test('It should return [ 17, 5, 1, 0, 2 ]', () => {
            const buffer = Buffer.from([ 0x51, 0x85 ]);

            const reader = new BitBuffer(buffer);

            let result = reader.read(6);

            expect(result.readUInt8()).toBe(17);

            result = reader.read(4);

            expect(result.readUInt8()).toBe(5);

            result = reader.read(3);

            expect(result.readUInt8()).toBe(1);

            result = reader.read(1);

            expect(result.readUInt8()).toBe(0);

            result = reader.read(2);

            expect(result.readUInt8()).toBe(2);
        });
    });

    describe('When reading chunks [ 10, 6 ] from [ 0x51, 0x85 ]', () => {
        test('It should return [ 337, 33 ]', () => {
            const buffer = Buffer.from([ 0x51, 0x85 ]);

            const reader = new BitBuffer(buffer);

            let result = reader.read(10);

            expect(result.readUint16LE()).toBe(337);

            result = reader.read(6);

            expect(result.readUInt8()).toBe(33);
        });
    });

    describe('When reading chunks [ 3, 11, 2 ] from [ 0xd4, 0x8d ]', () => {
        test('It should return [ 4, 442, 2 ]', () => {
            const buffer = Buffer.from([ 0xd4, 0x8d ]);

            const reader = new BitBuffer(buffer);

            let result = reader.read(3);

            expect(result.readUInt8()).toBe(4);

            result = reader.read(11);

            expect(result.readUint16LE()).toBe(442);

            result = reader.read(2);

            expect(result.readUInt8()).toBe(2);
        });
    });
});

describe('BitBuffer.readBit()', () => {
    describe('When reading bits from [ 0x8b ]', () => {
        test('It should return [ 1, 1, 0, 1, 0, 0, 0, 1 ]', () => {
            const buffer = Buffer.from([ 0x8b ]);

            const reader = new BitBuffer(buffer);

            const expected = [ 1, 1, 0, 1, 0, 0, 0, 1 ];

            expected.forEach((result) => {
                const value = reader.readBit();

                expect(value).toBe(result);
            });
        });
    });
});

describe('BitBuffer.readFloat()', () => {
    const isNegativeZero = x => x === 0 && (1 / x) === -Infinity;
    const isPositiveZero = x => x === 0 && (1 / x) === +Infinity;

    const buffer = Buffer.from([
        0x00, 0x00, 0x00, 0x00, // 0.0
        0x00, 0x00, 0x00, 0x80, // -0.0
        0x00, 0x00, 0x80, 0x3f, // 1.0
        0xdb, 0x0f, 0x49, 0x40, // 3.1415927
        0xff, 0xff, 0x7f, 0x7f  // 3.4028234663852886e+38
    ]);

    const reader = new BitBuffer(buffer);

    describe('When reading float from [ 0x00, 0x00, 0x00, 0x00 ]', () => {
        test('It should return a positive zero 0.0', () => {
            const value = reader.readFloat();

            expect(value).toBeCloseTo(0.0, 5);
            expect(isPositiveZero(value)).toBe(true);
        });
    });

    describe('When reading float from [ 0x00, 0x00, 0x00, 0x80 ]', () => {
        test('It should return a negative zero -0.0', () => {
            const value = reader.readFloat();

            expect(value).toBeCloseTo(-0.0, 5);
            expect(isNegativeZero(value)).toBe(true);
        });
    });

    describe('When reading float from [ 0x00, 0x00, 0x80, 0x3f ]', () => {
        test('It should return 1.0', () => {
            const value = reader.readFloat();

            expect(value).toBeCloseTo(1.0, 5);
        });
    });

    describe('When reading float from [ 0xdb, 0x0f, 0x49, 0x40 ]', () => {
        test('It should return 3.1415927', () => {
            const value = reader.readFloat();

            expect(value).toBeCloseTo(3.1415927, 5);
        });
    });

    describe('When reading float from [ 0xff, 0xff, 0x7f, 0x7f ]', () => {
        test('It should return 3.4028234663852886e+38', () => {
            const value = reader.readFloat();

            expect(value).toBeCloseTo(3.4028234663852886e+38, 5);
        });
    });
});

describe('BitBuffer.readVarInt32()', () => {
    const buffer = Buffer.from([
        0x7f,
        0x81, 0x7f,
        0xf0, 0xf0, 0xf0, 0xf0, 0x7f
    ]);

    const reader = new BitBuffer(buffer);

    describe('When reading Int32 from [ 0x7f ]', () => {
        test('It should return -64', () => {
            const value = reader.readVarInt32();

            expect(value).toBe(-64);
        });
    });

    describe('When reading Int32 from [ 0x81, 0x7f ]', () => {
        test('It should return -8129', () => {
            const value = reader.readVarInt32();

            expect(value).toBe(-8129);
        });
    });

    describe('When reading Int32 from [ 0xf0, 0xf0, 0xf0, 0xf0, 0x7f ]', () => {
        test('It should return -15852488', () => {
            const value = reader.readVarInt32();

            expect(value).toBe(-15852488);
        });
    });
});

describe('BitBuffer.readVarInt64()', () => {
    const buffer = Buffer.from([
        0x7f,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01
    ]);

    const reader = new BitBuffer(buffer);

    describe('When reading Int64 from [ 0x7f ]', () => {
        test('It should return -64n', () => {
            const value = reader.readVarInt64();

            expect(value).toBe(-64n);
        });
    });

    describe('When reading Int64 from [ 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01 ]', () => {
        test('It should return 4607430648700738616n', () => {
            const value = reader.readVarInt64();

            expect(value).toBe(-9223372036854775808n);
        });
    });
});

describe('BitBuffer.readUVarInt32()', () => {
    const buffer = Buffer.from([
        0x7f,
        0x81, 0x7f,
        0xff, 0xff, 0xff, 0xff, 0x7f
    ]);

    const reader = new BitBuffer(buffer);

    describe('When reading UInt32 from [ 0x7f ]', () => {
        test('It should return 127', () => {
            const value = reader.readUVarInt32();

            expect(value).toBe(127);
        });
    });

    describe('When reading UInt32 from [ 0x81, 0x7f ]', () => {
        test('It should return 16257', () => {
            const value = reader.readUVarInt32();

            expect(value).toBe(16257);
        });
    });

    describe('When reading UInt32 from [ 0xff, 0xff, 0xff, 0xff, 0x7f ]', () => {
        test('It should return 4294967295', () => {
            const value = reader.readUVarInt32();

            expect(value).toBe(4294967295);
        });
    });
});

describe('BitBuffer.readUVarInt64()', () => {
    const buffer = Buffer.from([
        0x7f,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01
    ]);

    const reader = new BitBuffer(buffer);

    describe('When reading UInt64 from [ 0x7f ]', () => {
        test('It should return 127n', () => {
            const value = reader.readUVarInt64();

            expect(value).toBe(127n);
        });
    });

    describe('When reading UInt64 from [ 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01 ]', () => {
        test('It should return 9223372036854775807n', () => {
            const value = reader.readUVarInt64();

            expect(value).toBe(18446744073709551615n);
        });
    });
});

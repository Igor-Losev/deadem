const BitBuffer = require('./../BitBufferFast');

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

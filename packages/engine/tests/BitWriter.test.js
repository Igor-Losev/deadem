import { describe, expect, test } from 'vitest';

import BitReader from '../src/core/BitReader.js';
import BitWriter from '../src/core/BitWriter.js';

const UNALIGNED_OFFSETS = [ 0, 1, 2, 3, 4, 5, 6, 7 ];

function createWriterAtOffset(offset, capacity = 64) {
    const writer = new BitWriter(capacity);

    writer.writeBitsAsUInt(0, offset);

    return writer;
}

function createReaderAtOffset(writer, offset) {
    const reader = new BitReader(writer.getBuffer());

    reader.move(offset);

    return reader;
}

describe('BitWriter.writeBitsAsUInt()', () => {
    describe('When writing chunks [ 6, 4, 3, 1, 2 ] with values [ 17, 5, 1, 0, 2 ]', () => {
        test('It should produce [ 0x51, 0x85 ]', () => {
            const writer = new BitWriter(2);

            writer.writeBitsAsUInt(17, 6);
            writer.writeBitsAsUInt(5, 4);
            writer.writeBitsAsUInt(1, 3);
            writer.writeBitsAsUInt(0, 1);
            writer.writeBitsAsUInt(2, 2);

            expect(writer.getBuffer()).toEqual(new Uint8Array([ 0x51, 0x85 ]));
        });
    });

    describe('When writing the maximum 32-bit value at every bit offset', () => {
        test.each(UNALIGNED_OFFSETS)('It should be read back at offset [ %i ]', (offset) => {
            const writer = createWriterAtOffset(offset);

            writer.writeBitsAsUInt(0xFFFFFFFF, 32);

            expect(createReaderAtOffset(writer, offset).readUInt32()).toBe(0xFFFFFFFF);
        });
    });

    describe('When writing zero bits', () => {
        test('It should not advance', () => {
            const writer = new BitWriter(0);

            writer.writeBitsAsUInt(0, 0);

            expect(writer.getBuffer().length).toBe(0);
        });
    });

    describe('When the value is invalid', () => {
        test.each([
            [ 'does not fit', 4, 2 ],
            [ 'is negative', -1, 8 ],
            [ 'is fractional', 1.5, 8 ],
            [ 'has too many bits', 0, 33 ]
        ])('It should throw when it %s', (_, value, count) => {
            expect(() => new BitWriter(16).writeBitsAsUInt(value, count)).toThrow();
        });
    });
});

describe('BitWriter.writeUVarInt()', () => {
    describe.each(UNALIGNED_OFFSETS)('When writing at bit offset [ %i ]', (offset) => {
        test.each([ 0, 15, 16, 255, 256, 4095, 4096, 0xFFFFFFFF ])('It should read back [ %i ]', (value) => {
            const writer = createWriterAtOffset(offset);

            writer.writeUVarInt(value);

            expect(createReaderAtOffset(writer, offset).readUVarInt()).toBe(value);
        });
    });

    describe('When the value is not an unsigned 32-bit integer', () => {
        test.each([ -1, 1.5, 0x100000000 ])('It should throw on [ %d ]', (value) => {
            expect(() => new BitWriter(16).writeUVarInt(value)).toThrow();
        });
    });
});

describe('BitWriter.writeUVarInt32()', () => {
    describe.each(UNALIGNED_OFFSETS)('When writing at bit offset [ %i ]', (offset) => {
        test.each([ 0, 127, 128, 16383, 16384, 0xFFFFFFFF ])('It should read back [ %i ]', (value) => {
            const writer = createWriterAtOffset(offset);

            writer.writeUVarInt32(value);

            expect(createReaderAtOffset(writer, offset).readUVarInt32()).toBe(value);
        });
    });

    describe('When the value is not an unsigned 32-bit integer', () => {
        test.each([ -1, 1.5, 0x100000000 ])('It should throw on [ %d ]', (value) => {
            expect(() => new BitWriter(16).writeUVarInt32(value)).toThrow();
        });
    });
});

describe('BitWriter.writeUInt8()', () => {
    describe.each(UNALIGNED_OFFSETS)('When writing at bit offset [ %i ]', (offset) => {
        test.each([ 0, 1, 0x80, 0xFF ])('It should read back [ %i ]', (value) => {
            const writer = createWriterAtOffset(offset);

            writer.writeUInt8(value);

            expect(createReaderAtOffset(writer, offset).readUInt8()).toBe(value);
        });
    });
});

describe('BitWriter.writeUInt32()', () => {
    describe.each(UNALIGNED_OFFSETS)('When writing at bit offset [ %i ]', (offset) => {
        test.each([ 0, 1, 0x12345678, 0xFFFFFFFF ])('It should read back [ %i ]', (value) => {
            const writer = createWriterAtOffset(offset);

            writer.writeUInt32(value);

            expect(createReaderAtOffset(writer, offset).readUInt32()).toBe(value);
        });
    });
});

describe('BitWriter.writeBytes()', () => {
    describe.each(UNALIGNED_OFFSETS)('When writing at bit offset [ %i ]', (offset) => {
        test('It should read the bytes back', () => {
            const bytes = new Uint8Array([ 0x00, 0xFF, 0xA5, 0x5A, 0x01, 0x80 ]);
            const writer = createWriterAtOffset(offset);

            writer.writeBytes(bytes);

            expect(createReaderAtOffset(writer, offset).read(bytes.length * 8, true)).toEqual(bytes);
        });

        test('It should keep the writer usable after an empty write', () => {
            const writer = createWriterAtOffset(offset);

            writer.writeBytes(new Uint8Array(0));
            writer.writeBitsAsUInt(5, 3);

            expect(createReaderAtOffset(writer, offset).readBitsAsUInt(3)).toBe(5);
        });
    });
});

describe('BitWriter.getBuffer()', () => {
    describe('When nothing has been written', () => {
        test('It should return no bytes', () => {
            expect(new BitWriter(4).getBuffer().length).toBe(0);
        });
    });

    describe('When the last byte is written partially', () => {
        test('It should include the byte and keep unused bits zero', () => {
            const writer = new BitWriter(4);

            writer.writeBitsAsUInt(0b111, 3);

            expect(writer.getBuffer()).toEqual(new Uint8Array([ 0b00000111 ]));
        });
    });
});

describe('BitWriter capacity', () => {
    describe('When the data fits exactly', () => {
        test('It should not throw', () => {
            const writer = new BitWriter(2);

            writer.writeBitsAsUInt(1, 3);
            writer.writeBytes(new Uint8Array([ 0xFF ]));
            writer.writeBitsAsUInt(1, 5);

            expect(writer.getBuffer().length).toBe(2);
        });
    });

    describe('When the data does not fit', () => {
        test('It should throw on bits', () => {
            expect(() => new BitWriter(1).writeBitsAsUInt(0, 9)).toThrow();
        });

        test('It should throw on bytes at an unaligned offset', () => {
            const writer = new BitWriter(1);

            writer.writeBitsAsUInt(0, 1);

            expect(() => writer.writeBytes(new Uint8Array([ 0xFF ]))).toThrow();
        });

        test('It should throw on variable-length values', () => {
            expect(() => new BitWriter(1).writeUVarInt32(128)).toThrow();
        });

        test.each([ 'writeUInt8', 'writeUInt32' ])('It should throw on [ %s ] at an aligned offset', (method) => {
            expect(() => new BitWriter(0)[method](0)).toThrow();
        });
    });
});

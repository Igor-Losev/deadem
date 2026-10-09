import { describe, expect, test } from 'vitest';

import BitBuffer from '#core/BitBuffer.js';
import FieldDecoderFactory from '#data/fields/decoding/FieldDecoderFactory.js';

describe('FieldDecoderFactory.FIXED_8', () => {
    test('reads exactly one byte and never continues into a following varint byte', () => {
        const reader = new BitBuffer(new Uint8Array([ 0x80, 0x01 ]));

        expect(FieldDecoderFactory.FIXED_8(reader)).toBe(128);

        // The high bit must not start a continuation: the next byte is untouched.
        expect(FieldDecoderFactory.FIXED_8(reader)).toBe(1);
    });

    test('reads the full unsigned byte range', () => {
        expect(FieldDecoderFactory.FIXED_8(new BitBuffer(new Uint8Array([ 0x00 ])))).toBe(0);
        expect(FieldDecoderFactory.FIXED_8(new BitBuffer(new Uint8Array([ 0xff ])))).toBe(255);
    });
});

describe('FieldDecoderFactory.FIXED_8_SIGNED', () => {
    test('sign-extends the byte', () => {
        expect(FieldDecoderFactory.FIXED_8_SIGNED(new BitBuffer(new Uint8Array([ 0x7f ])))).toBe(127);
        expect(FieldDecoderFactory.FIXED_8_SIGNED(new BitBuffer(new Uint8Array([ 0x80 ])))).toBe(-128);
        expect(FieldDecoderFactory.FIXED_8_SIGNED(new BitBuffer(new Uint8Array([ 0xff ])))).toBe(-1);
    });
});

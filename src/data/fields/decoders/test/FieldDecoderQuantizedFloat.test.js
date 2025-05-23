const FieldDecoderInstructions = require('./../../FieldDecoderInstructions');
const FieldDecoderQuantizedFloat = require('./../FieldDecoderQuantizedFloat');

describe('FieldDecoderQuantizedFloat.quantize()', () => {
    describe('When [ bitCount, low, high, flags ] set to [ 8, 0, 1, 0 ]', () => {
        const instructions = new FieldDecoderInstructions(null, 0, 8, 0, 1);

        const decoder = new FieldDecoderQuantizedFloat(instructions);

        it('It should return ~0.5 for 0.5', () => {
            expect(decoder.quantize(0.5)).toBeCloseTo(0.5, 2);
        });

        it('It should return 0 for 0', () => {
            expect(decoder.quantize(0)).toBe(0);
        });

        it('It should return 1 for 1', () => {
            expect(decoder.quantize(1)).toBe(1);
        });

        it('It should throw for 1.1 (high value reached)', () => {
            expect(() => decoder.quantize(1.1)).toThrowError();
        });

        it('It should throw for -0.1 (low value reached)', () => {
            expect(() => decoder.quantize(-0.1)).toThrowError();
        });
    });
});

import { describe, expect, test } from 'vitest';

import FieldPathBuilder from '#data/fields/path/FieldPathBuilder.js';

describe('FieldPathBuilder.build() and FieldPathBuilder.reconstruct()', () => {
    const p1 = [ 1 ];
    const p2 = [ 3, 3000, 40000, 0, 4 ];
    const p3 = [ 0, 100, 2000, 30000, 2000, 1000, 0 ];
    const p4 = [ 0, 100, 1000, 10000, 1000, 100, 0 ];

    const fp1 = FieldPathBuilder.build(p1);
    const fp2 = FieldPathBuilder.build(p2);
    const fp3 = FieldPathBuilder.build(p3);

    const code4 = 7924025361713770601030824755207n;

    test('It should return same FieldPath instances for same paths', () => {
        expect(FieldPathBuilder.build(p1)).toBe(fp1);
        expect(FieldPathBuilder.build(p2)).toBe(fp2);
        expect(FieldPathBuilder.build(p3)).toBe(fp3);
    });

    test('It should reconstruct FieldPath instance based on code', () => {
        const fp4 = FieldPathBuilder.reconstruct(code4);

        expect(fp4.path).toEqual(p4);
    });
});


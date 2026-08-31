import { describe, expect, test } from 'vitest';

import FieldPathBuilder from '#data/fields/path/FieldPathBuilder.js';

describe('FieldPathBuilder.build()', () => {
    const p1 = [ 1 ];
    const p2 = [ 3, 3000, 40000, 0, 4 ];
    const p3 = [ 0, 100, 2000, 30000, 2000, 1000, 0 ];

    const fp1 = FieldPathBuilder.build(p1);
    const fp2 = FieldPathBuilder.build(p2);
    const fp3 = FieldPathBuilder.build(p3);

    test('It should return same FieldPath instances for same paths', () => {
        expect(FieldPathBuilder.build(p1)).toBe(fp1);
        expect(FieldPathBuilder.build(p2)).toBe(fp2);
        expect(FieldPathBuilder.build(p3)).toBe(fp3);
    });
});

describe('FieldPathBuilder caching', () => {
    test('It should cache single-element paths', () => {
        const a = FieldPathBuilder.build([ 999 ]);
        const b = FieldPathBuilder.build([ 999 ]);

        expect(a).toBe(b);
    });

    test('It should cache two-element paths', () => {
        const a = FieldPathBuilder.build([ 11, 22 ]);
        const b = FieldPathBuilder.build([ 11, 22 ]);

        expect(a).toBe(b);
    });

    test('It should distinguish different paths', () => {
        const a = FieldPathBuilder.build([ 100 ]);
        const b = FieldPathBuilder.build([ 101 ]);

        expect(a).not.toBe(b);
    });

    test('It should distinguish paths of different lengths', () => {
        const a = FieldPathBuilder.build([ 7 ]);
        const b = FieldPathBuilder.build([ 7, 0 ]);

        expect(a).not.toBe(b);
    });
});

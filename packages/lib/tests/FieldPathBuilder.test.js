import { describe, expect, test } from 'vitest';

import FieldPath from '#data/fields/path/FieldPath.js';
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

describe('FieldPath.transferCode', () => {
    test('It should encode single-element path as Number', () => {
        const fp = FieldPathBuilder.build([ 42 ]);

        expect(typeof fp.transferCode).toBe('number');
    });

    test('It should encode two-element path as Number', () => {
        const fp = FieldPathBuilder.build([ 10, 200 ]);

        expect(typeof fp.transferCode).toBe('number');
    });

    test('It should fall back to BigInt for paths with length >= 3', () => {
        const fp = FieldPathBuilder.build([ 1, 2, 3 ]);

        expect(typeof fp.transferCode).toBe('bigint');
        expect(fp.transferCode).toBe(fp.code);
    });
});

describe('FieldPath.decodeTransferCode()', () => {
    test('It should decode single-element transferCode', () => {
        const fp = FieldPathBuilder.build([ 42 ]);
        const { length, p0 } = FieldPath.decodeTransferCode(fp.transferCode);

        expect(length).toBe(1);
        expect(p0).toBe(42);
    });

    test('It should decode two-element transferCode', () => {
        const fp = FieldPathBuilder.build([ 10, 200 ]);
        const { length, p0, p1 } = FieldPath.decodeTransferCode(fp.transferCode);

        expect(length).toBe(2);
        expect(p0).toBe(10);
        expect(p1).toBe(200);
    });

    test('It should decode large path element values', () => {
        const fp = FieldPathBuilder.build([ 65535 ]);
        const { length, p0 } = FieldPath.decodeTransferCode(fp.transferCode);

        expect(length).toBe(1);
        expect(p0).toBe(65535);
    });

    test('It should decode large two-element path values', () => {
        const fp = FieldPathBuilder.build([ 50000, 40000 ]);
        const { length, p0, p1 } = FieldPath.decodeTransferCode(fp.transferCode);

        expect(length).toBe(2);
        expect(p0).toBe(50000);
        expect(p1).toBe(40000);
    });
});

describe('FieldPathBuilder.reconstruct() with transferCode', () => {
    test('It should reconstruct single-element path from transferCode', () => {
        const original = FieldPathBuilder.build([ 77 ]);
        const reconstructed = FieldPathBuilder.reconstruct(original.transferCode);

        expect(reconstructed).toBe(original);
        expect(reconstructed.path).toEqual([ 77 ]);
    });

    test('It should reconstruct two-element path from transferCode', () => {
        const original = FieldPathBuilder.build([ 5, 300 ]);
        const reconstructed = FieldPathBuilder.reconstruct(original.transferCode);

        expect(reconstructed).toBe(original);
        expect(reconstructed.path).toEqual([ 5, 300 ]);
    });

    test('It should reconstruct from BigInt code for long paths', () => {
        const original = FieldPathBuilder.build([ 1, 2, 3, 4 ]);
        const reconstructed = FieldPathBuilder.reconstruct(original.code);

        expect(reconstructed).toBe(original);
        expect(reconstructed.path).toEqual([ 1, 2, 3, 4 ]);
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

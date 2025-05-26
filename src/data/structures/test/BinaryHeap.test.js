import { describe, expect, test } from 'vitest';

import BinaryHeap from './../BinaryHeap.js';

describe('BinaryHeap', () => {
    const getSourceData = () => [ 5, 6, 1, 0, 4 ];

    describe('When using max heap', () => {
        const data = getSourceData();
        const heap = new BinaryHeap(i => i, BinaryHeap.MAX_HEAP_COMPARATOR);

        test('It should insert values', () => {
            data.forEach((value) => {
                heap.insert(value);
            });

            expect(heap.length === data.length).toBe(true);
        });

        test('It should return max values', () => {
            const sorted = data.slice();

            sorted.sort((a, b) => b - a);

            sorted.forEach((value) => {
                expect(heap.extract()).toBe(value);
            });
        });
    });

    describe('When using min heap', () => {
        const data = getSourceData();
        const heap = new BinaryHeap(i => i, BinaryHeap.MIN_HEAP_COMPARATOR);

        test('It should insert values', () => {
            data.forEach((value) => {
                heap.insert(value);
            });

            expect(heap.length === data.length);
        });

        test('It should return min values', () => {
            const sorted = data.slice();

            sorted.sort((a, b) => a - b);

            sorted.forEach((value) => {
                expect(heap.extract()).toBe(value);
            });
        });
    });
});
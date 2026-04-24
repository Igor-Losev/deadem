import { describe, expect, test } from 'vitest';

import Queue from '#core/Queue.js';

describe('Queue', () => {
    const queue = new Queue();

    let index = 0;

    const factory = () => ({
        index: index++,
        data: Math.random()
    });

    const items = [ factory(), factory(), factory(), factory() ];

    test('It should enqueue', () => {
        items.forEach((item) => {
            queue.enqueue(item);
        });

        expect(queue._head.data).toBe(items[0]);
        expect(queue._tail.data).toBe(items[items.length - 1]);

        expect(queue.size).toBe(items.length);
    });

    test('It should dequeue', () => {
        items.forEach((item) => {
            const dequeued = queue.dequeue();

            expect(dequeued).toBe(item);
        });

        expect(queue._head).toBe(null);
        expect(queue._tail).toBe(null);

        expect(queue.size).toBe(0);
    });
});


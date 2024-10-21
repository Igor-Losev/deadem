'use strict';

const ITERATIONS = 1000 * 1000 * 10;

const BUFFER_SIZE = 1024 * 1;

const start = Date.now();

for (let i = 0; i < ITERATIONS; i++) {
    const buffer = Buffer.alloc(BUFFER_SIZE);

    console.log(buffer.buffer.byteLength);
}

const median = Date.now();

console.log(`Time #1:`, median - start);

for (let i = 0; i < ITERATIONS; i++) {
    const arrayBuffer = new ArrayBuffer(BUFFER_SIZE);

    const buffer = Buffer.from(arrayBuffer);
}

const end = Date.now();

console.log(`Time #2`, end - median);

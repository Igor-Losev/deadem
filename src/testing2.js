'use strict';

const arrayBuffer = new ArrayBuffer(1024);

const buffer1 = Buffer.from(arrayBuffer, 0, 10);
const buffer2 = Buffer.from(arrayBuffer, 10, arrayBuffer.byteLength - 10);

buffer1[0] = 1;
buffer2[0] = 2;

console.log(buffer1);
console.log(buffer2);

console.log(buffer1.length);
console.log(buffer2.length);

console.log(buffer1.buffer === buffer2.buffer);

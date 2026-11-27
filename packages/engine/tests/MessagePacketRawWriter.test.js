import { describe, expect, test } from 'vitest';

import MessagePacketRaw from '../src/data/MessagePacketRaw.js';
import MessagePacketRawExtractor from '../src/extractors/MessagePacketRawExtractor.js';
import MessagePacketRawWriter from '../src/writers/MessagePacketRawWriter.js';

function createMessage(type, bytes) {
    return new MessagePacketRaw(type, bytes.length, new Uint8Array(bytes));
}

function roundTrip(messages) {
    return new MessagePacketRawExtractor(new MessagePacketRawWriter(messages).all()).all();
}

function summarize(messages) {
    return messages.map(message => [ message.type, Array.from(message.payload) ]);
}

describe('MessagePacketRawWriter.all()', () => {
    describe('When there are no messages', () => {
        test('It should return no bytes', () => {
            expect(new MessagePacketRawWriter([ ]).all().length).toBe(0);
        });
    });

    describe('When message types need every width of the bit-packed format', () => {
        test('It should read them back', () => {
            const messages = [ 4, 55, 207, 4096, 0xFFFFFFFF ].map(type => createMessage(type, [ 1, 2, 3 ]));

            expect(summarize(roundTrip(messages))).toEqual(summarize(messages));
        });
    });

    describe('When a message has an empty payload', () => {
        test('It should keep it in the middle and at the end', () => {
            const messages = [ createMessage(4, [ 9 ]), createMessage(45, [ ]), createMessage(55, [ 7, 7 ]), createMessage(207, [ ]) ];

            expect(summarize(roundTrip(messages))).toEqual(summarize(messages));
        });
    });

    describe('When a payload needs a multi-byte size', () => {
        test('It should read it back', () => {
            const messages = [ createMessage(55, new Array(300).fill(0xAB)) ];

            expect(summarize(roundTrip(messages))).toEqual(summarize(messages));
        });
    });

    describe('When every message has the largest possible header', () => {
        test('It should fit into the capacity', () => {
            const messages = new Array(64).fill(null).map(() => createMessage(0xFFFFFFFF, [ ]));

            expect(() => new MessagePacketRawWriter(messages).all()).not.toThrow();
        });
    });
});

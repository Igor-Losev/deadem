import { describe, expect, test } from 'vitest';

import DemoCutIndex from '../src/cut/DemoCutIndex.js';

import DemoCutAction from '../src/data/enums/DemoCutAction.js';
import DemoPacketType from '../src/data/enums/DemoPacketType.js';

const FULL = DemoPacketType.DEM_FULL_PACKET.id;
const HEADER = DemoPacketType.DEM_FILE_HEADER.id;
const INFO = DemoPacketType.DEM_FILE_INFO.id;
const PACKET = DemoPacketType.DEM_PACKET.id;
const STOP = DemoPacketType.DEM_STOP.id;

const DROP = DemoCutAction.DROP;
const KEEP = DemoCutAction.KEEP;

/**
 * Sequences 0…8: the bootstrap, the first DEM_Packet, the body on ticks 1…4 with full packets on ticks 1 and 3, the tail.
 */
const TYPES = [ HEADER, PACKET, FULL, PACKET, PACKET, FULL, PACKET, STOP, INFO ];
const TICKS = [ -1, 1, 1, 2, 3, 3, 4, 4, 4 ];

function plan(from, to, types = TYPES, ticks = TICKS) {
    const demoCutPlan = new DemoCutIndex(Uint8Array.from(types), Int32Array.from(ticks)).getPlan(from, to);

    return types.map((_type, sequence) => demoCutPlan.getAction(sequence));
}

describe('DemoCutIndex', () => {
    describe('getPlan()', () => {
        test('It should keep the start, the packets of the window and the tail', () => {
            expect(plan(3, 3)).toEqual([ KEEP, KEEP, DROP, DROP, KEEP, KEEP, DROP, KEEP, KEEP ]);
        });

        test('It should keep every packet when the window covers the demo', () => {
            expect(plan(1, 4)).toEqual([ KEEP, KEEP, KEEP, KEEP, KEEP, KEEP, KEEP, KEEP, KEEP ]);
        });

        test('It should keep the full packet of the first tick when the window starts there', () => {
            expect(plan(1, 1)).toEqual([ KEEP, KEEP, KEEP, DROP, DROP, DROP, DROP, KEEP, KEEP ]);
        });

        test('It should accept a window that reaches past the demo', () => {
            expect(plan(4, 100)).toEqual([ KEEP, KEEP, DROP, DROP, DROP, DROP, KEEP, KEEP, KEEP ]);
            expect(plan(-100, 1)).toEqual([ KEEP, KEEP, KEEP, DROP, DROP, DROP, DROP, KEEP, KEEP ]);
        });

        test('It should reject an invalid window', () => {
            expect(() => plan(1.5, 2)).toThrow('ticks must be integers');
            expect(() => plan(3, 2)).toThrow('from must not exceed to');
            expect(() => plan(5, 9)).toThrow('outside of the demo [ 1, 4 ]');
            expect(() => plan(-9, 0)).toThrow('outside of the demo [ 1, 4 ]');
        });
    });

    describe('constructor()', () => {
        test('It should reject a demo without DEM_Packet or DEM_Stop', () => {
            expect(() => plan(1, 1, [ HEADER, STOP ], [ -1, 0 ])).toThrow('no DEM_Packet');
            expect(() => plan(1, 1, [ HEADER, PACKET, INFO ], [ -1, 1, 1 ])).toThrow('no DEM_Stop');
        });
    });
});

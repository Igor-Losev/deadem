import { describe, expect, test } from 'vitest';

import DemoCutIndex from '../src/cut/DemoCutIndex.js';

import DemoCutAction from '../src/data/enums/DemoCutAction.js';
import DemoPacketType from '../src/data/enums/DemoPacketType.js';

const FULL = DemoPacketType.DEM_FULL_PACKET.id;
const HEADER = DemoPacketType.DEM_FILE_HEADER.id;
const INFO = DemoPacketType.DEM_FILE_INFO.id;
const PACKET = DemoPacketType.DEM_PACKET.id;
const STOP = DemoPacketType.DEM_STOP.id;
const STRING_TABLES = DemoPacketType.DEM_STRING_TABLES.id;
const SYNC_TICK = DemoPacketType.DEM_SYNC_TICK.id;

const COLLECT_STATE = DemoCutAction.COLLECT_STATE;
const DROP = DemoCutAction.DROP;
const FILE_INFO = DemoCutAction.FILE_INFO;
const KEEP = DemoCutAction.KEEP;
const SNAPSHOT = DemoCutAction.SNAPSHOT;
const START_TABLES = DemoCutAction.START_TABLES;

/**
 * Sequences 0…8: the bootstrap, the first DEM_Packet, the body on ticks 1…4 with full packets on ticks 1 and 3, the tail.
 */
const TYPES = [ HEADER, PACKET, FULL, PACKET, PACKET, FULL, PACKET, STOP, INFO ];
const TICKS = [ -1, 1, 1, 2, 3, 3, 4, 4, 4 ];

function createEmptyTables(types) {
    return new Map(types.flatMap((type, sequence) => type === FULL ? [ [ sequence, [ ] ] ] : [ ]));
}

function plan(from, to, types = TYPES, ticks = TICKS, stringTables = createEmptyTables(types)) {
    const demoCutPlan = new DemoCutIndex(Uint8Array.from(types), Int32Array.from(ticks), stringTables).getPlan(from, to);

    return types.map((_type, sequence) => demoCutPlan.getAction(sequence));
}

describe('DemoCutIndex', () => {
    describe('getPlan()', () => {
        test('It should play the window from the last full packet at or before its start, collecting state before it', () => {
            expect(plan(1, 1)).toEqual([ KEEP, COLLECT_STATE, SNAPSHOT, DROP, DROP, DROP, DROP, KEEP, FILE_INFO ]);
            expect(plan(2, 2)).toEqual([ KEEP, COLLECT_STATE, SNAPSHOT, KEEP, DROP, DROP, DROP, KEEP, FILE_INFO ]);
            expect(plan(3, 3)).toEqual([ KEEP, COLLECT_STATE, DROP, COLLECT_STATE, COLLECT_STATE, SNAPSHOT, DROP, KEEP, FILE_INFO ]);
            expect(plan(4, 4)).toEqual([ KEEP, COLLECT_STATE, DROP, COLLECT_STATE, COLLECT_STATE, SNAPSHOT, KEEP, KEEP, FILE_INFO ]);
        });

        test('It should play the window from the first DEM_Packet when no full packet comes before it', () => {
            expect(plan(-100, 1)).toEqual([ KEEP, KEEP, KEEP, DROP, DROP, DROP, DROP, KEEP, FILE_INFO ]);
        });

        test('It should keep the whole body after the first full packet when the window covers the demo', () => {
            expect(plan(1, 4)).toEqual([ KEEP, COLLECT_STATE, SNAPSHOT, KEEP, KEEP, KEEP, KEEP, KEEP, FILE_INFO ]);
        });

        test('It should accept a window that reaches past the demo', () => {
            expect(plan(4, 100)).toEqual([ KEEP, COLLECT_STATE, DROP, COLLECT_STATE, COLLECT_STATE, SNAPSHOT, KEEP, KEEP, FILE_INFO ]);
        });

        test('It should keep original ticks for the body and move the tail onto the last kept tick', () => {
            const index = new DemoCutIndex(Uint8Array.from(TYPES), Int32Array.from(TICKS), createEmptyTables(TYPES));

            const cutAtThree = index.getPlan(3, 3);
            const cutFromStart = index.getPlan(-100, 1);
            const cutToEnd = index.getPlan(4, 100);

            expect(TYPES.map((_type, sequence) => cutAtThree.getTick(sequence))).toEqual([ -1, 1, 1, 2, 3, 3, 4, 3, 3 ]);
            expect(TYPES.map((_type, sequence) => cutFromStart.getTick(sequence))).toEqual([ -1, 1, 1, 2, 3, 3, 4, 1, 1 ]);
            expect(TYPES.map((_type, sequence) => cutToEnd.getTick(sequence))).toEqual([ -1, 1, 1, 2, 3, 3, 4, 4, 4 ]);
        });

        test('It should rewrite bootstrap DEM_StringTables only when the window starts from a snapshot', () => {
            const types = [ HEADER, STRING_TABLES, PACKET, FULL, PACKET, STOP, INFO ];
            const ticks = [ -1, -1, 1, 1, 2, 2, 2 ];

            expect(plan(2, 2, types, ticks)).toEqual([ KEEP, START_TABLES, COLLECT_STATE, SNAPSHOT, KEEP, KEEP, FILE_INFO ]);
            expect(plan(-100, 1, types, ticks)).toEqual([ KEEP, KEEP, KEEP, KEEP, DROP, KEEP, FILE_INFO ]);
            expect(() => plan(2, 2, types, ticks, new Map())).toThrow('string tables before snapshot [ 3 ] are missing');
        });

        test('It should schedule demo_gototick after DEM_SyncTick only when a snapshot exists and from is past the first tick', () => {
            const types = [ HEADER, SYNC_TICK, PACKET, FULL, PACKET, STOP, INFO ];
            const ticks = [ -1, -1, 1, 1, 2, 2, 2 ];
            const index = new DemoCutIndex(Uint8Array.from(types), Int32Array.from(ticks), createEmptyTables(types));

            expect(index.getPlan(2, 2).getCommands(1)).toEqual([ 'demo_gototick 2' ]);
            expect(index.getPlan(1, 2).getCommands(1)).toBeNull();
            expect(index.getPlan(-100, 1).getCommands(1)).toBeNull();

            const noSnapshotTypes = [ HEADER, SYNC_TICK, PACKET, PACKET, STOP, INFO ];
            const noSnapshotTicks = [ -1, -1, 1, 2, 2, 2 ];
            const noSnapshotIndex = new DemoCutIndex(Uint8Array.from(noSnapshotTypes), Int32Array.from(noSnapshotTicks));

            expect(noSnapshotIndex.getPlan(2, 2).getCommands(1)).toBeNull();
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

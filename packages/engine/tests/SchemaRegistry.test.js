import { describe, expect, test } from 'vitest';

import SchemaRegistry from '../src/SchemaRegistry.js';

import DemoPacketType from '../src/data/enums/DemoPacketType.js';
import MessagePacketType from '../src/data/enums/MessagePacketType.js';
import StringTableType from '../src/data/enums/StringTableType.js';

import createDescriptors from './support/createDescriptors.js';

describe('SchemaRegistry', () => {
    describe('registerDemoType', () => {
        test('It should decode a demo packet type with a proto name', () => {
            const registry = new SchemaRegistry(createDescriptors({ CDemoSyncTick: [ ] }));

            registry.registerDemoType(DemoPacketType.DEM_SYNC_TICK);

            expect(registry.resolveDemoType(3)).toBe(DemoPacketType.DEM_SYNC_TICK);
            expect(registry.getDemoDecoder(DemoPacketType.DEM_SYNC_TICK)?.descriptor.typeName).toBe('CDemoSyncTick');
        });

        test('It should register a demo packet type without a proto name and no decoder', () => {
            const registry = new SchemaRegistry(createDescriptors({ }));

            registry.registerDemoType(DemoPacketType.DEM_ERROR);

            expect(registry.resolveDemoTypeByCode('DEM_Error')).toBe(DemoPacketType.DEM_ERROR);
            expect(registry.getDemoDecoder(DemoPacketType.DEM_ERROR)).toBeNull();
        });
    });

    describe('registerMessageType', () => {
        test('It should decode a message packet type with a proto name', () => {
            const registry = new SchemaRegistry(createDescriptors({ CNETMsg_Tick: [ [ 'tick', 1, 'uint32' ] ] }));

            registry.registerMessageType(MessagePacketType.NET_TICK);

            const decoder = registry.getMessageDecoder(MessagePacketType.NET_TICK);

            expect(registry.resolveMessageTypeByCode('net_Tick')).toBe(MessagePacketType.NET_TICK);
            expect(decoder?.decode(new Uint8Array([ 0x08, 0x2a ])).tick).toBe(42);
        });
    });

    describe('registerStringTableType', () => {
        test('It should decode the values of a table with a proto name', () => {
            const registry = new SchemaRegistry(createDescriptors({ CMsgPlayerInfo: [ [ 'name', 1, 'string' ] ] }));

            registry.registerStringTableType(StringTableType.USER_INFO);

            const decoder = registry.getStringTableDecoder(StringTableType.USER_INFO);

            expect(decoder?.(new Uint8Array([ 0x0a, 0x03, 0x42, 0x6f, 0x62 ])).name).toBe('Bob');
        });

        test('It should keep the values of a table without a proto name raw', () => {
            const registry = new SchemaRegistry(createDescriptors({ }));

            registry.registerStringTableType(StringTableType.ENTITY_NAMES);

            expect(registry.getStringTableDecoder(StringTableType.ENTITY_NAMES)).toBeNull();
            expect(registry.resolveStringTableTypeByName('EntityNames')).toBe(StringTableType.ENTITY_NAMES);
        });

        test('It should throw when there is no message for the table', () => {
            const registry = new SchemaRegistry(createDescriptors({ }));

            expect(() => registry.registerStringTableType(StringTableType.USER_INFO)).toThrow('Unknown message [ CMsgPlayerInfo ]');
        });
    });
});

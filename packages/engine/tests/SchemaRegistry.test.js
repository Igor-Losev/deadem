import { describe, expect, test } from 'vitest';

import SchemaRegistry from '../src/SchemaRegistry.js';

import StringTableType from '../src/data/enums/StringTableType.js';

import createDescriptors from './support/createDescriptors.js';

describe('SchemaRegistry', () => {
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

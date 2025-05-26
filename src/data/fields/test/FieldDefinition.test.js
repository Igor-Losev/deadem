import { describe, expect, test } from 'vitest';

import FieldDefinition from './../FieldDefinition.js';

describe('FieldDefinition.parse()', () => {
    describe('When parsing "CNetworkUtlVectorBase< CHandle< CBaseEntity > >"', () => {
        const definition = FieldDefinition.parse('CNetworkUtlVectorBase< CHandle< CBaseEntity > >');

        test('It should have "CNetworkUtlVectorBase" as base type', () => {
            expect(definition.baseType).toBe('CNetworkUtlVectorBase');
        });

        test('It should have generic - "CHandle< CBaseEntity >"', () => {
            expect(definition.generic).not.toBeNull();
            expect(definition.generic.baseType).toBe('CHandle');
            expect(definition.generic.generic).not.toBeNull();
            expect(definition.generic.generic.baseType).toBe('CBaseEntity');
        });
    });

    describe('When parsing "CEntityIdentity*"', () => {
        const definition = FieldDefinition.parse('CEntityIdentity*');

        test('It should have "CEntityIdentity" as base type', () => {
            expect(definition.baseType).toBe('CEntityIdentity');
        });

        test('It should have pointer set to true', () => {
            expect(definition.pointer).toBe(true);
        });
    });

    describe('When parsing "CHandle< CBaseEntity >[64]"', () => {
        const definition = FieldDefinition.parse('CHandle< CBaseEntity >[64]');

        test('It should have "CHandle" as base type', () => {
            expect(definition.baseType).toBe('CHandle');
        });

        test('It should have "CBaseEntity" as generic base type', () => {
            expect(definition.generic).not.toBeNull();
            expect(definition.generic.baseType).toBe('CBaseEntity');
        });

        test('It should have a count of "64"', () => {
            expect(definition.count).toBe(64);
        });
    });
});

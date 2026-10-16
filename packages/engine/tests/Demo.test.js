import { describe, expect, test } from 'vitest';

import Class from '../src/data/Class.js';
import ClassBaseline from '../src/data/ClassBaseline.js';
import Demo from '../src/data/Demo.js';
import Entity from '../src/data/entity/Entity.js';
import StringTableType from '../src/data/enums/StringTableType.js';
import Serializer from '../src/data/fields/Serializer.js';
import StringTable from '../src/data/tables/string/StringTable.js';
import StringTableEntry from '../src/data/tables/string/StringTableEntry.js';
import StringTableInstructions from '../src/data/tables/string/StringTableInstructions.js';

function createClass(id, name) {
    return new Class(id, name, new Serializer(name, 1, []));
}

function createEntity(index, clazz) {
    return new Entity(index, 1, clazz);
}

describe('Demo', () => {
    test('It should expose entities by class name through the class index', () => {
        const demo = new Demo();
        const playerClass = createClass(1, 'CCitadelPlayerController');
        const rulesClass = createClass(2, 'CCitadelGameRulesProxy');
        const player1 = createEntity(10, playerClass);
        const player2 = createEntity(11, playerClass);
        const rules = createEntity(20, rulesClass);

        demo.registerEntity(player1);
        demo.registerEntity(rules);
        demo.registerEntity(player2);

        expect(demo.getEntitiesByClassName('CCitadelPlayerController')).toEqual([ player1, player2 ]);
        expect(Array.from(demo.getEntitiesByClassNameIterator('CCitadelPlayerController'))).toEqual([ player1, player2 ]);
        expect(Array.from(demo.getEntityIterator())).toEqual([ player1, player2, rules ]);
    });

    test('It should remove deleted entities from the class index', () => {
        const demo = new Demo();
        const clazz = createClass(1, 'CCitadelPlayerController');
        const player1 = createEntity(10, clazz);
        const player2 = createEntity(11, clazz);

        demo.registerEntity(player1);
        demo.registerEntity(player2);

        expect(demo.deleteEntity(10)).toBe(player1);
        expect(demo.getEntitiesByClassName('CCitadelPlayerController')).toEqual([ player2 ]);
    });

    test('It should update the class index when an entity index is replaced', () => {
        const demo = new Demo();
        const playerClass = createClass(1, 'CCitadelPlayerController');
        const npcClass = createClass(2, 'C_NPC_Trooper');
        const oldEntity = createEntity(10, playerClass);
        const newEntity = createEntity(10, npcClass);

        demo.registerEntity(oldEntity);
        demo.registerEntity(newEntity);

        expect(demo.getEntitiesByClassName('CCitadelPlayerController')).toEqual([]);
        expect(demo.getEntitiesByClassName('C_NPC_Trooper')).toEqual([ newEntity ]);
        expect(demo.getEntity(10)).toBe(newEntity);
    });

    test('It should clear the class index on reset', () => {
        const demo = new Demo();
        const clazz = createClass(1, 'CCitadelPlayerController');
        const entity = createEntity(10, clazz);

        demo.registerEntity(entity);
        demo.reset();

        expect(demo.getEntities()).toEqual([]);
        expect(demo.getEntitiesByClassName('CCitadelPlayerController')).toEqual([]);
        expect(Array.from(demo.getEntitiesByClassNameIterator('CCitadelPlayerController'))).toEqual([]);
        expect(demo.getEntity(10)).toBeNull();
    });

    test('It should not return a deleted entity through the index lookups', () => {
        const demo = new Demo();
        const clazz = createClass(1, 'CCitadelPlayerController');
        const entity = createEntity(10, clazz);

        demo.registerEntity(entity);

        expect(demo.getEntity(10)).toBe(entity);
        expect(demo.getEntityByHandle(entity.handle)).toBe(entity);

        demo.deleteEntity(10);

        expect(demo.getEntity(10)).toBeNull();
        expect(demo.getEntityByHandle(entity.handle)).toBeNull();
    });

    test('It should keep the class baseline when alternate baselines of the class arrive', () => {
        const demo = new Demo();
        const table = new StringTable(0, StringTableType.INSTANCE_BASE_LINE, 0, new StringTableInstructions(0, false, false));

        const baseline = new StringTableEntry(table, 0, '37', new Uint8Array([ 1, 2, 3 ]));
        const alternate = new StringTableEntry(table, 1, '37:0', new Uint8Array([ 9, 9, 9, 9 ]));

        table.registerEntry(baseline);
        table.registerEntry(alternate);

        demo.stringTableContainer.register(table);

        expect(demo.getClassBaseline(37).compare(new ClassBaseline(37, new Uint8Array([ 1, 2, 3 ])))).toBe(true);
    });

    test('It should register alternate baselines by class and index', () => {
        const demo = new Demo();
        const table = new StringTable(0, StringTableType.INSTANCE_BASE_LINE, 0, new StringTableInstructions(0, false, false));

        table.registerEntry(new StringTableEntry(table, 0, '37:0', new Uint8Array([ 9, 9, 9, 9 ])));
        table.registerEntry(new StringTableEntry(table, 1, '37:12', new Uint8Array([ 7 ])));

        demo.stringTableContainer.register(table);

        expect(demo.getAlternateBaseline(37, 0).compare(new ClassBaseline(37, new Uint8Array([ 9, 9, 9, 9 ])))).toBe(true);
        expect(demo.getAlternateBaseline(37, 12).compare(new ClassBaseline(37, new Uint8Array([ 7 ])))).toBe(true);
        expect(demo.getAlternateBaseline(37, 1)).toBeNull();
        expect(demo.getClassBaseline(37)).toBeNull();

        demo.reset();

        expect(demo.getAlternateBaseline(37, 0)).toBeNull();
    });
});

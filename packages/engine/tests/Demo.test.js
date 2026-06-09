import { describe, expect, test } from 'vitest';

import Class from '#data/Class.js';
import Demo from '#data/Demo.js';
import Entity from '#data/entity/Entity.js';
import Serializer from '#data/fields/Serializer.js';

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
});

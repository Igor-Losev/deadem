import { describe, expect, test } from 'vitest';

import Class from '#data/Class.js';
import Entity from '#data/entity/Entity.js';
import EntityMutationBatch from '#data/entity/EntityMutationBatch.js';
import EntityMutationEvent from '#data/entity/EntityMutationEvent.js';
import Serializer from '#data/fields/Serializer.js';
import FieldPathBuilder from '#data/fields/path/FieldPathBuilder.js';
import FieldStorageDescriptor from '#data/fields/decoding/FieldStorageDescriptor.js';

import EntityOperation from '#data/enums/EntityOperation.js';

const FIELDS = {
    1: { name: 'm_flHealth', storage: FieldStorageDescriptor.FLOAT },
    2: { name: 'm_iScore', storage: FieldStorageDescriptor.INT_SIGNED },
    3: { name: 'm_nCount', storage: FieldStorageDescriptor.INT_UNSIGNED },
    4: { name: 'm_bFlag', storage: FieldStorageDescriptor.INT_BOOL },
    5: { name: 'CBodyComponent.m_vecOrigin', storage: FieldStorageDescriptor.createVector(3) },
    6: { name: 'm_szName', storage: FieldStorageDescriptor.MISC }
};

const NAME_TO_ID = Object.fromEntries(Object.entries(FIELDS).map(([ id, f ]) => [ f.name, Number(id) ]));

function createClass(id = 1, name = 'CTest') {
    const serializer = new Serializer(name, 1, [ ]);

    serializer.getStorageForFieldPathId = (fieldPathId) => FIELDS[fieldPathId].storage;
    serializer.getNameForFieldPathId = (fieldPathId) => FIELDS[fieldPathId].name;

    return new Class(id, name, serializer);
}

function createEntity(clazz, index = 1) {
    return new Entity(index, 1, clazz);
}

function populate(entity) {
    entity.updateByFieldPathId(1, 100.5);
    entity.updateByFieldPathId(2, -7);
    entity.updateByFieldPathId(3, 0xFFFFFFFF);
    entity.updateByFieldPathId(4, 1);
    entity.updateByFieldPathId(5, [ 1.5, 2.5, 3.5 ]);
    entity.updateByFieldPathId(6, 'hello');
}

describe('Entity read API', () => {
    test('getFieldById reads each storage type with the right JS shape', () => {
        const entity = createEntity(createClass());

        populate(entity);

        expect(entity.getFieldById(1)).toBeCloseTo(100.5, 5);
        expect(entity.getFieldById(2)).toBe(-7);
        expect(entity.getFieldById(3)).toBe(0xFFFFFFFF);
        expect(entity.getFieldById(4)).toBe(true);
        expect(Array.from(entity.getFieldById(5))).toEqual([ 1.5, 2.5, 3.5 ]);
        expect(entity.getFieldById(5)).toBeInstanceOf(Float32Array);
        expect(entity.getFieldById(6)).toBe('hello');
    });

    test('getField resolves by flattened name', () => {
        const entity = createEntity(createClass());

        populate(entity);

        expect(entity.getField('m_flHealth')).toBeCloseTo(100.5, 5);
        expect(entity.getField('m_bFlag')).toBe(true);
        expect(entity.getField('m_szName')).toBe('hello');
        expect(Array.from(entity.getField('CBodyComponent.m_vecOrigin'))).toEqual([ 1.5, 2.5, 3.5 ]);
    });

    test('absent and unknown fields read as undefined', () => {
        const clazz = createClass();
        const a = createEntity(clazz, 1);
        const b = createEntity(clazz, 2);

        populate(a);

        b.updateByFieldPathId(1, 5);

        expect(b.getFieldById(2)).toBeUndefined();
        expect(b.getField('m_iScore')).toBeUndefined();

        expect(a.getField('m_doesNotExist')).toBeUndefined();
    });

    test('hasField reflects per-entity presence', () => {
        const clazz = createClass();
        const a = createEntity(clazz, 1);
        const b = createEntity(clazz, 2);

        populate(a);
        b.updateByFieldPathId(1, 5);

        expect(a.hasField('m_iScore')).toBe(true);
        expect(b.hasField('m_iScore')).toBe(false);
        expect(a.hasField('m_doesNotExist')).toBe(false);
    });

    test('reads never mutate the shared layout', () => {
        const clazz = createClass();
        const entity = createEntity(clazz);

        entity.updateByFieldPathId(1, 1);

        const before = clazz.layout.getMetas().length;

        entity.getFieldById(2);
        entity.getField('m_iScore');
        entity.hasField('m_iScore');

        expect(clazz.layout.getMetas().length).toBe(before);
    });

    test('getFieldCount counts present typed fields plus misc entries', () => {
        const entity = createEntity(createClass());

        populate(entity);

        expect(entity.getFieldCount()).toBe(6);
    });

    test('fieldNames / fieldEntries enumerate present fields without a snapshot', () => {
        const entity = createEntity(createClass());

        populate(entity);

        expect(new Set(entity.fieldNames())).toEqual(new Set(Object.values(FIELDS).map(f => f.name)));

        const entries = Object.fromEntries(entity.fieldEntries());

        expect(entries.m_bFlag).toBe(true);
        expect(entries.m_szName).toBe('hello');
        expect(entity._snapshot).toBeNull();
    });

    test('getField matches unpackFlattened for the same entity', () => {
        const entity = createEntity(createClass());

        populate(entity);

        const unpacked = entity.unpackFlattened();

        for (const name of Object.keys(unpacked)) {
            const pointed = entity.getField(name);

            if (pointed instanceof Float32Array) {
                expect(Array.from(pointed)).toEqual(Array.from(unpacked[name]));
            } else {
                expect(pointed).toBe(unpacked[name]);
            }
        }
    });

    test('Class.getFieldPathId tracks field paths as they are classified', () => {
        const clazz = createClass();
        const entity = createEntity(clazz);

        entity.updateByFieldPathId(1, 1);

        expect(clazz.getFieldPathId('m_flHealth')).toBe(1);
        expect(clazz.getFieldPathId('m_iScore')).toBeNull();

        entity.updateByFieldPathId(2, 1);

        expect(clazz.getFieldPathId('m_iScore')).toBe(NAME_TO_ID.m_iScore);
    });
});

describe('Entity construction', () => {
    test('rejects an out-of-range entity index', () => {
        const clazz = createClass();

        expect(() => new Entity(16383, 1, clazz)).not.toThrow();
        expect(() => new Entity(16384, 1, clazz)).toThrow();
        expect(() => new Entity(-1, 1, clazz)).toThrow();
    });
});

describe('EntityMutationEvent', () => {
    function createEventEntity(idToName = new Map()) {
        const serializer = new Serializer('CTest', 1, [ ]);

        serializer.getNameForFieldPathId = (fieldPathId) => idToName.get(fieldPathId);

        return new Entity(1, 1, new Class(1, 'CTest', serializer));
    }

    test('getChanges resolves the batch into a name-keyed delta', () => {
        const fp1 = FieldPathBuilder.build([ 1 ]);
        const fp2 = FieldPathBuilder.build([ 2 ]);
        const names = new Map([ [ fp1.id, 'm_flHealth' ], [ fp2.id, 'm_iScore' ] ]);

        const batch = new EntityMutationBatch(Uint32Array.of(fp1.id, fp2.id), [ 123, 'abc' ]);
        const event = new EntityMutationEvent(EntityOperation.UPDATE, createEventEntity(names), batch);

        expect(event.getChanges()).toEqual({ m_flHealth: 123, m_iScore: 'abc' });
        expect(event.getChanges()).toBe(event.getChanges());
    });

    test('mutations reconstructs field-path/value pairs', () => {
        const fp1 = FieldPathBuilder.build([ 1 ]);
        const fp2 = FieldPathBuilder.build([ 2 ]);

        const batch = new EntityMutationBatch(Uint32Array.of(fp1.id, fp2.id), [ 123, 'abc' ]);
        const event = new EntityMutationEvent(EntityOperation.UPDATE, createEventEntity(), batch);

        const mutations = event.mutations;

        expect(mutations).toHaveLength(2);
        expect(mutations[0].fieldPath).toBe(fp1);
        expect(mutations[0].value).toBe(123);
        expect(mutations[1].fieldPath.code).toBe(fp2.code);
        expect(mutations[1].value).toBe('abc');
        expect(event.mutations).toBe(mutations);
    });

    test('an empty event yields no mutations or changes', () => {
        const event = EntityMutationEvent.createEmpty(EntityOperation.LEAVE, createEventEntity());

        expect(event.mutations).toHaveLength(0);
        expect(event.getChanges()).toEqual({ });
    });
});

import { describe, expect, test } from 'vitest';

import Class from '#data/Class.js';
import Entity from '#data/entity/Entity.js';
import EntityMutationBatch from '#data/entity/EntityMutationBatch.js';
import EntityMutationEvent from '#data/entity/EntityMutationEvent.js';
import Serializer from '#data/fields/Serializer.js';
import FieldDefinition from '#data/fields/FieldDefinition.js';
import FieldPathBuilder from '#data/fields/path/FieldPathBuilder.js';
import FieldDecoder from '#data/fields/decoding/FieldDecoder.js';
import FieldStorageDescriptor from '#data/fields/decoding/FieldStorageDescriptor.js';

import FieldArrayFixed from '#data/fields/models/FieldArrayFixed.js';
import FieldArrayVariable from '#data/fields/models/FieldArrayVariable.js';
import FieldScalar from '#data/fields/models/FieldScalar.js';
import FieldTableFixed from '#data/fields/models/FieldTableFixed.js';
import FieldTableVariable from '#data/fields/models/FieldTableVariable.js';

import EntityOperation from '#data/enums/EntityOperation.js';

const FIELD_NAMES = [ 'm_flHealth', 'm_iScore', 'm_nCount', 'm_bFlag', 'CBodyComponent.m_vecOrigin', 'm_szName' ];

function createClass() {
    const decoder = (storage) => new FieldDecoder(() => {}, storage);
    const definition = FieldDefinition.parse('uint32');
    const scalar = (name, storage) => new FieldScalar(name, [ '0' ], definition, decoder(storage));

    const body = new Serializer('CBody', 1, [ scalar('m_vecOrigin', FieldStorageDescriptor.createVector(3)) ]);

    const serializer = new Serializer('CTest', 1, [
        scalar('m_flHealth', FieldStorageDescriptor.FLOAT),
        scalar('m_iScore', FieldStorageDescriptor.INT_SIGNED),
        scalar('m_nCount', FieldStorageDescriptor.INT_UNSIGNED),
        scalar('m_bFlag', FieldStorageDescriptor.INT_BOOL),
        new FieldTableFixed('CBodyComponent', [ '0' ], definition, body, decoder(FieldStorageDescriptor.INT_BOOL)),
        scalar('m_szName', FieldStorageDescriptor.MISC)
    ]);

    return new Class(1, 'CTest', serializer);
}

function createEntity(clazz, index = 1) {
    return new Entity(index, 1, clazz);
}

function populate(entity) {
    const set = (path, value) => entity.updateByFieldPathId(FieldPathBuilder.build(path).id, value);

    set([ 0 ], 100.5);
    set([ 1 ], -7);
    set([ 2 ], 0xFFFFFFFF);
    set([ 3 ], 1);
    set([ 4, 0 ], [ 1.5, 2.5, 3.5 ]);
    set([ 5 ], 'hello');
}

describe('Entity read API', () => {
    test('reads each storage type with the right JS shape', () => {
        const entity = createEntity(createClass());

        populate(entity);

        expect(entity.getField('m_flHealth')).toBeCloseTo(100.5, 5);
        expect(entity.getField('m_iScore')).toBe(-7);
        expect(entity.getField('m_nCount')).toBe(0xFFFFFFFF);
        expect(entity.getField('m_bFlag')).toBe(true);
        expect(Array.from(entity.getField('CBodyComponent.m_vecOrigin'))).toEqual([ 1.5, 2.5, 3.5 ]);
        expect(entity.getField('CBodyComponent.m_vecOrigin')).toBeInstanceOf(Float32Array);
        expect(entity.getField('m_szName')).toBe('hello');
    });

    test('getField / hasField read value and check presence', () => {
        const entity = createEntity(createClass());

        populate(entity);

        expect(entity.getField('m_flHealth')).toBe(entity.getField('m_flHealth'));
        expect(entity.hasField('m_szName')).toBe(true);
    });

    test('absent and unknown fields read as undefined', () => {
        const clazz = createClass();
        const a = createEntity(clazz, 1);
        const b = createEntity(clazz, 2);

        populate(a);

        b.updateByFieldPathId(FieldPathBuilder.build([ 0 ]).id, 5);

        expect(b.getField('m_iScore')).toBeUndefined();
        expect(a.getField('m_doesNotExist')).toBeUndefined();
    });

    test('has reflects per-entity presence', () => {
        const clazz = createClass();
        const a = createEntity(clazz, 1);
        const b = createEntity(clazz, 2);

        populate(a);
        b.updateByFieldPathId(FieldPathBuilder.build([ 0 ]).id, 5);

        expect(a.hasField('m_iScore')).toBe(true);
        expect(b.hasField('m_iScore')).toBe(false);
        expect(a.hasField('m_doesNotExist')).toBe(false);
    });

    test('reads never mutate the shared layout', () => {
        const clazz = createClass();
        const entity = createEntity(clazz);

        entity.updateByFieldPathId(FieldPathBuilder.build([ 0 ]).id, 1);

        const before = clazz.layout.getMetas().length;

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

        expect(new Set(entity.fieldNames())).toEqual(new Set(FIELD_NAMES));

        const entries = Object.fromEntries(entity.fieldEntries());

        expect(entries.m_bFlag).toBe(true);
        expect(entries.m_szName).toBe('hello');
        expect(entity._snapshot).toBeNull();
    });

    test('get matches unpackFlattened for the same entity', () => {
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
});

describe('Entity.getField', () => {
    const definition = FieldDefinition.parse('uint32');
    const decoder = () => new FieldDecoder(() => {}, FieldStorageDescriptor.INT_UNSIGNED);

    const sub = (fields) => new Serializer('Sub', 1, fields);
    const scalar = (name) => new FieldScalar(name, [ '0' ], definition, decoder());
    const array = (name) => new FieldArrayVariable(name, [ '0' ], definition, decoder(), decoder());
    const fixed = (name, size) => new FieldArrayFixed(name, [ '0' ], new FieldDefinition('uint32', null, size, false), decoder());
    const table = (name, serializer) => new FieldTableVariable(name, [ '0' ], definition, serializer, decoder());
    const tableFixed = (name, serializer) => new FieldTableFixed(name, [ '0' ], definition, serializer, decoder());

    function buildClass() {
        const stateSerializer = sub([ scalar('m_id'), scalar('m_bits') ]);
        const idSerializer = () => sub([ scalar('m_id') ]);
        const innerSerializer = () => sub([ array('m_vecInner') ]);
        const outerSerializer = sub([ scalar('m_id'), array('m_vecInner') ]);

        const serializer = new Serializer('CArr', 1, [
            array('m_vecAbilities'),
            table('m_vecState', stateSerializer),
            table('m_vecOuter', outerSerializer),
            scalar('m_flHealth'),
            tableFixed('CBodyComponent', innerSerializer()),
            array('m_vecShrunkScalar'),
            table('m_vecShrunkObject', idSerializer()),
            array('m_vecZeroStale'),
            table('m_vecTrailingGap', idSerializer()),
            table('m_vecNestedTrailingGap', innerSerializer()),
            table('m_vecGap', innerSerializer()),
            array('m_vecEmpty'),
            array('m_vecUnseen'),
            fixed('m_rgFixed', 3)
        ]);

        return new Class(1, 'CArr', serializer);
    }

    function createArrayEntity() {
        const entity = new Entity(1, 1, buildClass());
        const set = (path, value) => entity.updateByFieldPathId(FieldPathBuilder.build(path).id, value);

        set([ 0 ], 3); set([ 0, 0 ], 100); set([ 0, 1 ], 200); set([ 0, 2 ], 300);
        set([ 1 ], 2); set([ 1, 0, 0 ], 1); set([ 1, 0, 1 ], 7); set([ 1, 1, 0 ], 2); set([ 1, 1, 1 ], 8);
        set([ 2 ], 1); set([ 2, 0, 0 ], 9); set([ 2, 0, 1 ], 2); set([ 2, 0, 1, 0 ], 100); set([ 2, 0, 1, 1 ], 200);
        set([ 3 ], 55);
        set([ 4, 0 ], 2); set([ 4, 0, 0 ], 100); set([ 4, 0, 1 ], 200);
        set([ 5 ], 1); set([ 5, 0 ], 5); set([ 5, 1 ], 99);
        set([ 6 ], 1); set([ 6, 0, 0 ], 5); set([ 6, 1, 0 ], 99);
        set([ 7 ], 0); set([ 7, 0 ], 77);
        set([ 8 ], 3); set([ 8, 0, 0 ], 5);
        set([ 9 ], 1); set([ 9, 0, 0 ], 3); set([ 9, 0, 0, 0 ], 10);
        set([ 10 ], 1); set([ 10, 0, 0 ], 2); set([ 10, 0, 0, 1 ], 200);
        set([ 11 ], 0);
        set([ 13, 0 ], 11); set([ 13, 1 ], 22); set([ 13, 2 ], 33);

        return entity;
    }

    test('reconstructs a scalar vector into a flat array', () => {
        expect(createArrayEntity().getField('m_vecAbilities')).toEqual([ 100, 200, 300 ]);
    });

    test('reconstructs a struct vector into an array of objects', () => {
        expect(createArrayEntity().getField('m_vecState')).toEqual([
            { m_id: 1, m_bits: 7 },
            { m_id: 2, m_bits: 8 }
        ]);
    });

    test('reconstructs a vector nested inside a struct element', () => {
        expect(createArrayEntity().getField('m_vecOuter')).toEqual([
            { m_id: 9, m_vecInner: [ 100, 200 ] }
        ]);
    });

    test('drills into a nested array by an indexed name', () => {
        expect(createArrayEntity().getField('m_vecOuter.0000.m_vecInner')).toEqual([ 100, 200 ]);
    });

    test('reconstructs an array wrapped in an inline struct', () => {
        expect(createArrayEntity().getField('CBodyComponent.m_vecInner')).toEqual([ 100, 200 ]);
    });

    test('scalar counted array drops stale children beyond the count', () => {
        expect(createArrayEntity().getField('m_vecShrunkScalar')).toEqual([ 5 ]);
    });

    test('object counted array drops stale children beyond the count', () => {
        expect(createArrayEntity().getField('m_vecShrunkObject')).toEqual([ { m_id: 5 } ]);
    });

    test('a zero count wins over stale children', () => {
        expect(createArrayEntity().getField('m_vecZeroStale')).toEqual([ ]);
    });

    test('counted object arrays preserve trailing gaps up to the count', () => {
        expect(createArrayEntity().getField('m_vecTrailingGap')).toEqual([
            { m_id: 5 },
            undefined,
            undefined
        ]);
    });

    test('nested counted arrays preserve trailing gaps up to the count', () => {
        expect(createArrayEntity().getField('m_vecNestedTrailingGap')).toEqual([
            {
                m_vecInner: [ 10, undefined, undefined ]
            }
        ]);
    });

    test('handles a gap at index 0 in a nested vector without leaking the count', () => {
        const element = createArrayEntity().getField('m_vecGap')[0];

        expect(Array.isArray(element.m_vecInner)).toBe(true);
        expect(element.m_vecInner[0]).toBeUndefined();
        expect(element.m_vecInner[1]).toBe(200);
    });

    test('returns an empty array for a zero-length vector', () => {
        expect(createArrayEntity().getField('m_vecEmpty')).toEqual([ ]);
    });

    test('reads each kind in its natural shape', () => {
        const entity = createArrayEntity();

        expect(entity.getField('m_flHealth')).toBe(55);                          // scalar
        expect(entity.getField('m_vecAbilities')).toEqual([ 100, 200, 300 ]);    // array
        expect(entity.getField('m_vecOuter.0000')).toEqual({ m_id: 9, m_vecInner: [ 100, 200 ] }); // struct
        expect(entity.getField('m_vecAbilities.0000')).toBe(100);               // scalar element
        expect(entity.getField('m_doesNotExist')).toBeUndefined();
    });

    test('has reflects per-entity presence via schema resolution', () => {
        const entity = createArrayEntity();

        expect(entity.hasField('m_flHealth')).toBe(true);
        expect(entity.hasField('m_vecAbilities')).toBe(true);
        expect(entity.hasField('m_vecAbilities.0000')).toBe(true);
        expect(entity.hasField('m_doesNotExist')).toBe(false);
        expect(entity.hasField('m_vecUnseen')).toBe(false);
    });

    test('getFieldAccessorForName walks the schema independently of entity state', () => {
        const clazz = createArrayEntity().class;

        expect(clazz.serializer.getFieldAccessorForName('m_vecOuter.0000.m_vecInner').field.name).toBe('m_vecInner');
        expect(clazz.serializer.getFieldAccessorForName('m_doesNotExist')).toBeNull();

        // A schema field never populated still resolves and compiles an accessor.
        expect(clazz.serializer.getFieldAccessorForName('m_vecUnseen')).not.toBeNull();
        expect(clazz.getFieldAccessor('m_vecUnseen')).not.toBeNull();
    });

    test('reconstructs a fixed array from its definition count, without a count parent', () => {
        expect(createArrayEntity().getField('m_rgFixed')).toEqual([ 11, 22, 33 ]);
    });

    test('getAccessor compiles once, caches, and resolves any field', () => {
        const clazz = createArrayEntity().class;
        const accessor = clazz.getFieldAccessor('m_vecAbilities');

        expect(accessor).not.toBeNull();
        expect(clazz.getFieldAccessor('m_vecAbilities')).toBe(accessor);
        expect(clazz.getFieldAccessor('m_flHealth')).not.toBeNull();
        expect(clazz.getFieldAccessor('m_doesNotExist')).toBeNull();
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

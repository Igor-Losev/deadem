/** @import EntityOperation from '../enums/EntityOperation.js' */

/** @import Entity from './Entity.js' */

import FieldPathBuilder from '../fields/path/FieldPathBuilder.js';

import EntityMutation from './EntityMutation.js';
import EntityMutationBatch from './EntityMutationBatch.js';

class EntityMutationEvent {
    /**
     * @public
     * @constructor
     * @param {EntityOperation} operation
     * @param {Entity} entity
     * @param {EntityMutationBatch} batch
     */
    constructor(operation, entity, batch) {
        /** @private */
        this._operation = operation;
        /** @private */
        this._entity = entity;
        /** @private */
        this._batch = batch;

        /** @private */
        this._mutations = null;
        /** @private */
        this._changes = null;
    }

    /**
     * @public
     * @returns {EntityOperation}
     */
    get operation() {
        return this._operation;
    }

    /**
     * @public
     * @returns {Entity}
     */
    get entity() {
        return this._entity;
    }

    /**
     * @public
     * @returns {EntityMutationBatch}
     */
    get batch() {
        return this._batch;
    }

    /**
     * (Lazy).
     *
     * @public
     * @returns {Array<EntityMutation>}
     */
    get mutations() {
        if (this._mutations !== null) {
            return this._mutations;
        }

        const batch = this._batch;
        const mutations = new Array(batch.length);

        for (let i = 0; i < batch.length; i++) {
            mutations[i] = new EntityMutation(FieldPathBuilder.getById(batch.ids[i]), batch.values[i]);
        }

        this._mutations = mutations;

        return mutations;
    }

    /**
     * Creates a mutation-less event.
     *
     * @internal
     * @public
     * @static
     * @param {EntityOperation} operation
     * @param {Entity} entity
     * @returns {EntityMutationEvent}
     */
    static createEmpty(operation, entity) {
        return new EntityMutationEvent(operation, entity, EntityMutationBatch.EMPTY);
    }

    /**
     * Returns changed fields as a flattened object. When `names` is
     * `null` returns all fields. Otherwise returns a same-order
     * array — `undefined` for fields not in this event.
     *
     * @public
     * @param {Array<string>|null} [names=null]
     * @returns {Record<string, unknown>|Array<unknown>}
     */
    getChanges(names = null) {
        const batch = this._batch;

        if (names === null) {
            if (this._changes !== null) {
                return this._changes;
            }

            /** @type {Record<string, unknown>} */
            const changes = {};
            const serializer = this._entity.class.serializer;

            for (let i = 0; i < batch.length; i++) {
                changes[serializer.getNameForFieldPathId(batch.ids[i])] = batch.values[i];
            }

            this._changes = changes;

            return changes;
        }

        const count = names.length;

        const serializer = this._entity.class.serializer;
        const result = new Array(count);

        let found = 0;

        for (let i = batch.length - 1; i >= 0 && found < count; i--) {
            const name = serializer.getNameForFieldPathId(batch.ids[i]);

            for (let j = 0; j < count; j++) {
                if (names[j] === name) {
                    if (result[j] === undefined) {
                        result[j] = batch.values[i];

                        found++;
                    }

                    break;
                }
            }
        }

        return result;
    }
}

export default EntityMutationEvent;

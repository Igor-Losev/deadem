import FieldPathBuilder from '#data/fields/path/FieldPathBuilder.js';

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
        this._operation = operation;
        this._entity = entity;
        this._batch = batch;

        this._mutations = null;
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
     * (Lazy). Resolves the per-event delta as an object keyed by field name.
     *
     * @public
     * @returns {Object<string, *>}
     */
    getChanges() {
        if (this._changes !== null) {
            return this._changes;
        }

        const changes = {};

        const serializer = this._entity.class.serializer;
        const batch = this._batch;

        for (let i = 0; i < batch.length; i++) {
            changes[serializer.getNameForFieldPathId(batch.ids[i])] = batch.values[i];
        }

        this._changes = changes;

        return changes;
    }
}

export default EntityMutationEvent;

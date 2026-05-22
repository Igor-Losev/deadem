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
     * @public
     * @returns {Array<EntityMutation>}
     */
    get mutations() {
        if (this._mutations !== null) {
            return this._mutations;
        }

        const mutations = new Array(this._batch.length);
        let i = 0;

        this._batch.forEach((fieldPath, value) => {
            mutations[i++] = new EntityMutation(fieldPath, value);
        });

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
     * Resolves the per-event delta as an object keyed by field name.
     *
     * @public
     * @returns {Object<string, *>}
     */
    getChanges() {
        if (this._changes !== null) {
            return this._changes;
        }

        const changes = { };
        const serializer = this._entity.class.serializer;

        this._batch.forEach((fieldPath, value) => {
            changes[serializer.getNameForFieldPath(fieldPath)] = value;
        });

        this._changes = changes;

        return changes;
    }
}

export default EntityMutationEvent;

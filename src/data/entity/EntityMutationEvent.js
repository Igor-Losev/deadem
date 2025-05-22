'use strict';

class EntityMutationEvent {
    /**
     * @public
     * @param {EntityOperation} operation
     * @param {Entity} entity
     * @param {Array<EntityMutation>} mutations
     */
    constructor(operation, entity, mutations) {
        this._operation = operation;
        this._entity = entity;
        this._mutations = mutations;
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
     * @returns {Array<EntityMutation>}
     */
    get mutations() {
        return this._mutations;
    }
}

module.exports = EntityMutationEvent;

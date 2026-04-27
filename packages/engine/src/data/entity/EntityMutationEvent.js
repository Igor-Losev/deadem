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
     * @returns {Array<EntityMutation>}
     */
    get mutations() {
        return this._mutations;
    }

    /**
     * Resolves and returns the per-event delta as an object keyed by field name.
     * The result is computed lazily on the first call and cached for subsequent calls.
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

        for (let i = 0; i < this._mutations.length; i++) {
            const mutation = this._mutations[i];
            const name = serializer.getNameForFieldPath(mutation.fieldPath);

            changes[name] = mutation.value;
        }

        this._changes = changes;

        return changes;
    }
}

export default EntityMutationEvent;

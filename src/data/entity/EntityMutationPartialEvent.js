/**
 * Represents a partial mutation event used by
 * threads in concurrent parsing.
 */
class EntityMutationPartialEvent {
    /**
     * @public
     * @constructor
     * @param {number} bitPointer
     * @param {number} entityIndex
     * @param {number} entityClassId
     * @param {Array<EntityMutation>} mutations
     */
    constructor(bitPointer, entityIndex, entityClassId, mutations) {
        this._bitPointer = bitPointer;
        this._entityIndex = entityIndex;
        this._entityClassId = entityClassId;
        this._mutations = mutations;
    }

    /**
     * @public
     * @returns {number}
     */
    get bitPointer() {
        return this._bitPointer;
    }

    /**
     * @public
     * @returns {number}
     */
    get entityIndex() {
        return this._entityIndex;
    }

    /**
     * @public
     * @returns {number}
     */
    get entityClassId() {
        return this._entityClassId;
    }

    /**
     * @public
     * @returns {Array<EntityMutation>}
     */
    get mutations() {
        return this._mutations;
    }
}

export default EntityMutationPartialEvent;

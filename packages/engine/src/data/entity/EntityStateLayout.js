import Assert from '#core/Assert.js';

import FieldStorageType from '#data/enums/FieldStorageType.js';

import Serializer from '#data/fields/Serializer.js';

/**
 * Storage plan for entity state.
 */
class EntityStateLayout {
    /**
     * @public
     * @constructor
     * @param {Serializer} serializer
     */
    constructor(serializer) {
        Assert.isTrue(serializer instanceof Serializer);

        this._serializer = serializer;

        this._lengths = {
            float: 0,
            int: 0,
            presence: 0
        };

        this._metas = {
            byId: new Map(),
            order: [ ]
        };
    }

    /**
     * Number of float cells (single floats plus vector components) assigned.
     *
     * @public
     * @returns {number}
     */
    getFloatLength() {
        return this._lengths.float;
    }

    /**
     * Number of int cells assigned.
     *
     * @public
     * @returns {number}
     */
    getIntLength() {
        return this._lengths.int;
    }

    /**
     * All assigned field metas in assignment order.
     *
     * @public
     * @returns {Array<Object>}
     */
    getMetas() {
        return this._metas.order;
    }

    /**
     * Number of presence flags assigned so far (one per typed field).
     *
     * @public
     * @returns {number}
     */
    getPresenceLength() {
        return this._lengths.presence;
    }

    /**
     * Returns the meta for an already-classified field path id.
     *
     * @public
     * @param {number} fieldPathId
     * @returns {Object|null}
     */
    peek(fieldPathId) {
        return this._metas.byId.get(fieldPathId) || null;
    }

    /**
     * Returns the meta for a field path id, classifying and assigning a slot on
     * first sighting.
     *
     * @public
     * @param {number} fieldPathId
     * @returns {Object}
     */
    peekOrAssign(fieldPathId) {
        const existing = this.peek(fieldPathId);

        if (existing !== null) {
            return existing;
        }

        const meta = this._classify(fieldPathId);

        this._metas.byId.set(fieldPathId, meta);
        this._metas.order.push(meta);

        return meta;
    }

    /**
     * @protected
     * @param {number} fieldPathId
     * @returns {Object}
     */
    _classify(fieldPathId) {
        const descriptor = this._serializer.getStorageForFieldPathId(fieldPathId);

        switch (descriptor.type) {
            case FieldStorageType.FLOAT:
            case FieldStorageType.VECTOR: {
                const offset = this._lengths.float;

                this._lengths.float += descriptor.dim;

                return createMeta(fieldPathId, descriptor.type, offset, descriptor.dim, this._lengths.presence++, false, false);
            }
            case FieldStorageType.INT: {
                const offset = this._lengths.int;

                this._lengths.int += 1;

                return createMeta(fieldPathId, FieldStorageType.INT, offset, 1, this._lengths.presence++, descriptor.signed, descriptor.bool);
            }
            default:
                return createMeta(fieldPathId, FieldStorageType.MISC, -1, 0, -1, false, false);
        }
    }
}

/**
 * @param {number} id
 * @param {FieldStorageType} storage
 * @param {number} offset
 * @param {number} dim
 * @param {number} present
 * @param {boolean} signed
 * @param {boolean} bool
 * @returns {Object}
 */
function createMeta(id, storage, offset, dim, present, signed, bool) {
    return { id, storage, offset, dim, present, signed, bool };
}

export default EntityStateLayout;

import Assert from '#core/Assert.js';

class EntityMutationBatch {
    /**
     * @public
     * @constructor
     * @param {Uint32Array} ids
     * @param {Readonly<Array<*>>} values
     */
    constructor(ids, values) {
        Assert.isTrue(ids instanceof Uint32Array);
        Assert.isTrue(Array.isArray(values));
        Assert.isTrue(ids.length === values.length);

        this._ids = ids;
        this._values = values;
    }

    /**
     * @public
     * @returns {Uint32Array} 
     */
    get ids() {
        return this._ids;
    }

    /**
     * @public
     * @returns {number}
     */
    get length() {
        return this._ids.length;
    }

    /**
     * @public
     * @returns {Readonly<Array<*>>} 
     */
    get values() {
        return this._values;
    }

    /**
     * @public
     * @static
     * @returns {EntityMutationBatch} 
     */
    static get EMPTY() {
        return empty;
    }

    /**
     * Concatenates several batches into a single one.
     *
     * @public
     * @static
     * @param {Array<EntityMutationBatch>} batches
     * @returns {EntityMutationBatch}
     */
    static concat(batches) {
        let total = 0;

        for (let i = 0; i < batches.length; i++) {
            total += batches[i]._ids.length;
        }

        if (total === 0) {
            return EntityMutationBatch.EMPTY;
        }

        const ids = new Uint32Array(total);
        const values = new Array(total);

        let offset = 0;

        for (let b = 0; b < batches.length; b++) {
            const batch = batches[b];

            ids.set(batch._ids, offset);

            for (let i = 0; i < batch._values.length; i++) {
                values[offset + i] = batch._values[i];
            }

            offset += batch._ids.length;
        }

        return new EntityMutationBatch(ids, values);
    }
}

const empty = new EntityMutationBatch(new Uint32Array(0), Object.freeze([ ]));

export default EntityMutationBatch;

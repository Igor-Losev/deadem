import Assert from '#core/Assert.js';
import BitBuffer from '#core/BitBuffer.js';

import EntityMutationExtractor from '#extractors/EntityMutationExtractor.js';

import EntityMutationBatch from './entity/EntityMutationBatch.js';

class ClassBaseline {
    /**
     * @constructor
     * @param {number} classId
     * @param {Uint8Array|null} raw
     */
    constructor(classId, raw) {
        Assert.isTrue(Number.isInteger(classId));
        Assert.isTrue(raw === null || ArrayBuffer.isView(raw));

        this._classId = classId;
        this._raw = raw;
        this._batch = null;
    }

    /**
     * @public
     * @returns {number}
     */
    get classId() {
        return this._classId;
    }

    /**
     * @public
     * @returns {Uint8Array|null}
     */
    get raw() {
        return this._raw;
    }

    /**
     * @public
     * @param {Serializer} serializer
     * @returns {EntityMutationBatch}
     */
    getBatch(serializer) {
        if (this._batch !== null) {
            return this._batch;
        }

        if (this._raw === null) {
            this._batch = EntityMutationBatch.EMPTY;
        } else {
            this._batch = new EntityMutationExtractor(new BitBuffer(this._raw), serializer).all();
        }

        return this._batch;
    }

    /**
     * @public
     * @param {ClassBaseline} other
     * @returns {boolean}
     */
    compare(other) {
        if (this._classId !== other._classId) {
            return false;
        }

        if (this._raw === other._raw) {
            return true;
        }

        if (this._raw === null || other._raw === null) {
            return false;
        }

        if (this._raw.length !== other._raw.length) {
            return false;
        }

        for (let i = 0; i < this._raw.length; i++) {
            if (this._raw[i] !== other._raw[i]) {
                return false;
            }
        }

        return true;
    }
}

export default ClassBaseline;

import { Readable } from 'node:stream';

import Assert from '#core/Assert.js';
import Gate from '#core/Gate.js';

class ReadableArrayNode extends Readable {
    /**
     * @public
     * @constructor
     * @param {Array<*>} array
     * @param {boolean} [gated=false]
     */
    constructor(array, gated = false) {
        super({ objectMode: true });

        Assert.isTrue(Array.isArray(array), 'array must be an array');

        this._array = array;
        this._index = 0;
        this._gate = gated ? new Gate() : null;
    }

    /**
     * Releases the next item in the stream.
     * Only works when the stream is created with `gated=true`.
     *
     * @public
     */
    release() {
        if (this._gate === null) {
            throw new Error(`release() can only be called on a gated ReadableArray`);
        }

        this._gate.release();
    }

    _destroy(error, callback) {
        if (this._gate !== null) {
            this._gate.destroy();
        }

        this._array = [];

        callback(error);
    }

    _read() {
        if (this._index >= this._array.length) {
            this.push(null);

            return;
        }

        if (this._gate !== null) {
            this._gate.acquire().then(() => {
                if (this.destroyed) {
                    return;
                }

                this.push(this._array[this._index++]);
            }).catch((_) => { });
        } else {
            this.push(this._array[this._index++]);
        }
    }
}

export default ReadableArrayNode;

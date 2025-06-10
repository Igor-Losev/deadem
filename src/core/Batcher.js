import Assert from '#core/Assert.js';

class Batcher {
    constructor(size, processor = noop, thresholdWaitMilliseconds = 50) {
        Assert.isTrue(Number.isInteger(size) && size > 0);
        Assert.isTrue(typeof processor === 'function');

        this._size = size;
        this._processor = processor;
        this._thresholdWaitMilliseconds = thresholdWaitMilliseconds;

        this._batch = [ ];

        this._timeoutId = null;
    }

    /**
     * @public
     * @param {BatchItem} item
     */
    push(item) {
        if (this._timeoutId !== null) {
            clearTimeout(this._timeoutId);

            this._timeoutId = null;
        }

        this._batch.push(item);

        if (this._batch.length === this._size) {
            this._process();
        }

        this._timeoutId = setTimeout(() => {
            this._process();

            this._timeoutId = null;
        }, this._thresholdWaitMilliseconds);
    }

    /**
     * @protected
     */
    _process() {
        if (this._batch.length === 0) {
            return;
        }

        const batch = this._batch.slice();

        this._batch.length = 0;

        this._processor(batch);
    }
}

/**
 * @typedef {*} BatchItem
 */

function noop() {}

export default Batcher;

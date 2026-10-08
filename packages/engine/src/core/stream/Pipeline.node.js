import Stream from 'node:stream';

import DeferredPromise from '../DeferredPromise.js';
import WritableSink from '#core/stream/WritableSink.js';

class PipelineNode {
    /**
     * @public
     * @constructor
     * @param {Stream.Readable} readable
     * @param {Array<Stream.Transform>} transforms
     * @param {Stream.Writable|null} [writable=null]
     */
    constructor(readable, transforms, writable = null) {
        const deferred = new DeferredPromise();

        const destination = writable !== null ? writable : new WritableSink();

        Stream.pipeline(
            readable,
            ...transforms,
            destination,
            (error) => {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve();
                }
            }
        );

        /** @private */
        this._aborted = false;
        /** @private */
        this._deferred = deferred;
        /** @private */
        this._readable = readable;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get aborted() {
        return this._aborted;
    }

    /**
     * @public
     */
    abort() {
        this._aborted = true;

        this._readable.destroy();
    }

    /**
     * @public
     * @returns {Promise<*>}
     */
    ready() {
        return this._deferred.promise;
    }
}

export default PipelineNode;

import Stream from 'node:stream';

import WritableNoopStreamNode from '#core/stream/WritableNoopStream.node.js';

import DeferredPromise from '#data/DeferredPromise.js';

class PipelineNode {
    /**
     * @public
     * @constructor
     * @param {Stream.Readable} readable
     * @param {Array<Stream.Transform>} transforms
     */
    constructor(readable, transforms) {
        const deferred = new DeferredPromise();

        const writeNoop = new WritableNoopStreamNode();

        Stream.pipeline(
            readable,
            ...transforms,
            writeNoop,
            (error) => {
                if (error) {
                    deferred.reject(error);
                } else {
                    deferred.resolve();
                }
            }
        );

        this._deferred = deferred;
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

import DeferredPromise from '#data/DeferredPromise.js';

class WritableSinkStreamBrowser extends WritableStream {
    /**
     * @public
     * @constructor
     * @param {(function(*): void)|null} [onWrite=null] - Optional callback invoked for each chunk.
     */
    constructor(onWrite = null) {
        const deferred = new DeferredPromise();

        super({
            write(chunk) {
                if (onWrite !== null) {
                    onWrite(chunk);
                }
            },
            close() {
                deferred.resolve();
            },
            abort(error) {
                deferred.reject(error);
            }
        });

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

export default WritableSinkStreamBrowser;

import DeferredPromise from '#data/DeferredPromise.js';

class WritableNoopStreamBrowser extends WritableStream {
    constructor() {
        const deferred = new DeferredPromise();

        super({
            write() {

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

export default WritableNoopStreamBrowser;

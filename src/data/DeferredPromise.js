class DeferredPromise {
    constructor() {
        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    /**
     * @public
     * @returns {Promise<any>}
     */
    get promise() {
        return this._promise;
    }

    /**
     * @public
     * @param {...any} args
     */
    resolve(...args) {
        this._resolve(...args);
    }

    /**
     * @public
     * @param {...any} args
     */
    reject(...args) {
        this._reject(...args);
    }
}

export default DeferredPromise;

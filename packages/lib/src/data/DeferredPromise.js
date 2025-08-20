class DeferredPromise {
    constructor() {
        this._fulfilled = false;
        this._rejected = false;

        this._promise = new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    /**
     * @public
     * @returns {boolean}
     */
    get fulfilled() {
        return this._fulfilled;
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
     * @returns {boolean}
     */
    get rejected() {
        return this._rejected;
    }

    /**
     * @public
     * @param {...any} args
     */
    resolve(...args) {
        this._fulfilled = true;

        this._resolve(...args);
    }

    /**
     * @public
     * @param {...any} args
     */
    reject(...args) {
        this._rejected = true;

        this._reject(...args);
    }
}

export default DeferredPromise;

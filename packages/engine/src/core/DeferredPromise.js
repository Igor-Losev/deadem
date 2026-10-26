/**
 * @template T
 */
class DeferredPromise {
    constructor() {
        /** @private */
        this._fulfilled = false;
        /** @private */
        this._rejected = false;
        /** @private */
        this._settled = false;

        /** @private */
        this._promise = new Promise((resolve, reject) => {
            /** @private */
            this._resolve = resolve;
            /** @private */
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
     * @returns {Promise<T>}
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
     * @returns {boolean}
     */
    get settled() {
        return this._settled;
    }

    /**
     * @public
     * @param {T} [value]
     */
    resolve(value) {
        this._fulfilled = true;
        this._settled = true;

        this._resolve(/** @type {T} */ (value));
    }

    /**
     * @public
     * @param {any} reason
     */
    reject(reason) {
        this._rejected = true;
        this._settled = true;

        this._reject(reason);
    }
}

export default DeferredPromise;

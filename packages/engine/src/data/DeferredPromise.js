/**
 * @template T
 */
class DeferredPromise {
    constructor() {
        this._fulfilled = false;
        this._rejected = false;
        this._settled = false;

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
     * @param {T} value
     */
    resolve(value) {
        this._fulfilled = true;
        this._settled = true;

        this._resolve(value);
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

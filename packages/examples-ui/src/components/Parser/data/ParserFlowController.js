import { DeferredPromise } from 'deadem';

class ParserFlowController {
    constructor() {
        this._capacity = 0;
        this._deferred = null;
    }

    /** 
     * @public
     * @returns {void}
     */
    close() {
        this._capacity = 0;
    }

    /**
     * @public
     * @returns {boolean} 
     */
    getIsOpened() {
        return this._getIsOpened();
    }

    /**
     * @param {number} capacity
     * @returns {void}
     */
    open(capacity) {
        this._capacity = capacity - 1;

        const deferred = this._deferred;

        this._deferred = null;

        deferred.resolve(this._capacity);
    }

    /** 
     * @public
     * @returns {Promise<number>}
     */
    ready() {
        if (this._getIsOpened()) {
            this._capacity -= 1;

            return Promise.resolve(this._capacity);
        } else {
            this._deferred = new DeferredPromise();

            return this._deferred.promise;
        }
    }

    /**
     * @protected
     * @returns {boolean} 
     */
    _getIsOpened() {
        return this._capacity > 0;
    }
}

export default ParserFlowController;


class Tracker {
    /**
     * @abstract
     * @constructor
     */
    constructor() {

    }

    /**
     * @public
     */
    getStats() {
        throw new Error('Tracker.getStats() is not implemented');
    }
}

export default Tracker;

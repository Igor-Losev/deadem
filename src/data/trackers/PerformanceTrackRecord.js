import Assert from './../../core/Assert.js';

import PerformanceTrackerCategory from './../enums/PerformanceTrackerCategory.js';

class PerformanceTrackRecord {
    /**
     * @public
     * @constructor
     * @param {PerformanceTrackerCategory} category
     */
    constructor(category) {
        Assert.isTrue(category instanceof PerformanceTrackerCategory);

        this._category = category;

        this._accumulator = 0;
        this._average = 0;
        this._count = 0;
        this._now = null;
        this._running = false;
    }

    get accumulator() {
        return this._accumulator;
    }

    get average() {
        return this._average;
    }

    get count() {
        return this._count;
    }

    /**
     * @public
     */
    commit() {
        if (!this._running) {
            throw new Error(`Unable to commit record for [ ${this._category.code} ]`);
        }

        const now = Date.now();

        const difference = now - this._now;

        this._accumulator += difference;

        const currentAverage = this._average * this._count;

        this._average = (currentAverage + difference) / (this._count + 1);
        this._count += 1;
        this._running = false;
    }

    /**
     * @public
     */
    touch() {
        if (this._running) {
            throw new Error(`Unable to touch record for [ ${this._category.code} ]`);
        }

        this._now = Date.now();

        this._running = true;
    }
}

export default PerformanceTrackRecord;

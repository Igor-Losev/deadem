import Assert from '#core/Assert.js';

import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';

class PerformanceTrackerRecord {
    /**
     * @public
     * @constructor
     * @param {PerformanceTrackerCategory} category
     */
    constructor(category) {
        Assert.isTrue(category instanceof PerformanceTrackerCategory);

        this._category = category;

        this._started = false;
        this._startedAt = null;

        this._stats = {
            avg: 0,
            count: 0,
            sum: 0
        };
    }

    /**
     * @public
     * @returns {PerformanceTrackerRecordStats}
     */
    getSnapshot() {
        return {
            ...this._stats
        };
    }

    /**
     * @public
     */
    start() {
        if (this._started) {
            throw new Error(`Unable to start tracking of [ ${this._category.code} ]`);
        }

        this._started = true;
        this._startedAt = Date.now();
    }

    /**
     * @public
     */
    end() {
        if (!this._started) {
            throw new Error(`Unable to end tracking of [ ${this._category.code} ]`);
        }

        const difference = Date.now() - this._startedAt;

        this._stats.avg = (this._stats.avg * this._stats.count + difference) / (this._stats.count + 1);
        this._stats.count += 1;
        this._stats.sum += difference;

        this._started = false;
        this._startedAt = null;
    }
}

/**
 * @typedef {{ avg: number, count: number, sum: number }} PerformanceTrackerRecordStats
 */

export default PerformanceTrackerRecord;

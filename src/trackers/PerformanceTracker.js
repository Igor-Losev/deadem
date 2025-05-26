import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';
import PerformanceTrackRecord from '#data/trackers/PerformanceTrackRecord.js';

import Tracker from './Tracker.js';

class PerformanceTracker extends Tracker {
    /**
     * @constructor
     * @param {Logger} logger
     */
    constructor(logger) {
        super(logger);

        this._registry = new Map();
    }

    /**
     * @public
     * @param {PerformanceTrackerCategory} category
     */
    start(category) {
        const record = this._registry.get(category) || new PerformanceTrackRecord(category);

        record.touch();

        this._registry.set(category, record);
    }

    /**
     * @public
     * @param {PerformanceTrackerCategory} category
     */
    end(category) {
        const record = this._registry.get(category);

        if (record === null) {
            throw new Error(`Unable to finish tracking of the category [ ${category.code} ]`);
        }

        record.commit();
    }

    /**
     * @public
     */
    print() {
        const open = this._highlight('<PerformanceTracker>');
        const close = this._highlight('</PerformanceTracker>');

        this._logger.info(open);

        const walk = (category, depth = 0) => {
            const record = this._registry.get(category) || null;

            if (record !== null) {
                const prefix = `${'\t'.repeat(depth)}`;

                this._logger.info(`${prefix.length > 0 ? `${prefix} ` : ''}[ ${category.code} ]: total [ ${this._formatNumber(record.accumulator)} ] ms, [ ${this._formatNumber(record.count)} ] run(s) with [ ${this._formatNumber(Math.round(record.average * 1000) / 1000)} ] ms in average`);
            }

            category.categories.forEach((subcategory) => {
                walk(subcategory, depth + 1);
            });
        };

        walk(PerformanceTrackerCategory.PARSER);

        this._logger.info(close);
    }
}

export default PerformanceTracker;

'use strict';

const PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory'),
    PerformanceTrackRecord = require('./../data/trackers/PerformanceTrackRecord');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('PerformanceTracker');

class PerformanceTracker {
    constructor() {
        this._registry = new Map();
    }

    /**
     * @public
     * @param {PerformanceTrackerCategory} category
     */
    start(category) {
        logger.debug(`Starting tracking of the category [ ${category.code} ]`);

        const record = this._registry.get(category) || new PerformanceTrackRecord(category);

        record.touch();

        this._registry.set(category, record);
    }

    /**
     * @public
     * @param {PerformanceTrackerCategory} category
     */
    end(category) {
        logger.debug(`Finishing tracking of the category [ ${category.code} ]`);

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
        const format = n => n.toLocaleString('en-US');
        const highlight = s => `----- ${s} -----`;

        logger.info(highlight('<PerformanceTracker>'));

        const walk = (category, depth = 0) => {
            const record = this._registry.get(category) || null;

            if (record !== null) {
                const prefix = `${'\t'.repeat(depth)}`;

                logger.info(`${prefix.length > 0 ? `${prefix} ` : ''}[ ${category.code} ]: total [ ${format(record.accumulator)} ] ms, [ ${format(record.count)} ] run(s) with [ ${format(Math.round(record.average * 1000) / 1000)} ] ms in average`);
            }

            category.categories.forEach((subcategory) => {
                walk(subcategory, depth + 1);
            });
        };

        walk(PerformanceTrackerCategory.PARSER);

        logger.info(highlight('</PerformanceTracker>'));
    }
}

module.exports = PerformanceTracker;

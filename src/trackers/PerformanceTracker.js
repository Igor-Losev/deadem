import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';
import PerformanceTrackerRecord from '#data/trackers/PerformanceTrackerRecord.js';

import Tracker from './Tracker.js';

class PerformanceTracker extends Tracker {
    constructor() {
        super();

        this._registry = new Map();
    }

    /**
     * @public
     * @param {PerformanceTrackerCategory} category
     */
    end(category) {
        const record = this._registry.get(category) || null;

        if (record === null) {
            throw new Error(`Unable to end tracking of the category [ ${category.code} ]`);
        }

        record.end();
    }

    /**
     * @public
     * @returns {PerformanceTrackerStats}
     */
    getStats() {
        return getStatsRecursively.call(this);
    }

    /**
     * @public
     * @param {PerformanceTrackerCategory} category
     */
    start(category) {
        const record = this._registry.get(category) || new PerformanceTrackerRecord(category);

        record.start();

        this._registry.set(category, record);
    }
}

/**
 * @param {PerformanceTrackerNode=} reference
 * @returns {PerformanceTrackerNode}
 */
function getStatsRecursively(reference = getNode()) {
    const record = this._registry.get(reference.category) || null;

    if (record === null) {
        return reference;
    }

    reference.stats = record.getSnapshot();

    reference.category.categories.forEach((category) => {
        if (this._registry.has(category)) {
            const child = getNode(category);

            reference.children.push(child);

            getStatsRecursively.call(this, child);
        }
    });

    return reference;
}

/**
 * @param {PerformanceTrackerCategory} category
 * @returns {PerformanceTrackerNode}
 */
function getNode(category = PerformanceTrackerCategory.PARSER) {
    return {
        category,
        children: [ ],
        stats: null
    };
}

/**
 * @typedef {Object} PerformanceTrackerNode
 * @property {Array<PerformanceTrackerNode>} children
 * @property {PerformanceTrackerRecordStats|null} stats
 * @property {PerformanceTrackerCategory} category
 */

/**
 * @typedef {PerformanceTrackerNode} PerformanceTrackerStats
 */

export default PerformanceTracker;

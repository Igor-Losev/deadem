const PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('PerformanceTracker');

class PerformanceTracker {
    constructor() {
        this._store = new Map();
    }

    /**
     * @public
     * @param {PerformanceTrackerCategory} category
     */
    start(category) {
        const now = Date.now();

        const track = this._store.get(category) || { accumulator: 0, average: 0, count: 0, start: now };

        track.start = now;

        this._store.set(category, track);
    }

    /**
     * @public
     * @param {PerformanceTrackerCategory} category
     */
    end(category) {
        const now = Date.now();

        const track = this._store.get(category) || null;

        if (track === null) {
            logger.error(`Unknown category [ ${category} ]`);

            throw new Error(`PerformanceTracker Error`);
        }


        if (track.start === null) {
            logger.error(`Unable to track [ ${category} ] category: start is not set`);

            throw new Error(`PerformanceTracker Error`);
        }

        const difference = now - track.start;

        track.accumulator += difference;
        track.average = (track.average * track.count + difference) / (track.count + 1);
        track.count += 1;
        track.start = null;
    }

    print() {
        logger.info(`----- <PerformanceTracker> -----`);

        const log = (category, full = false) => {
            const track = this._store.get(category);

            let message = `[ ${category.code} ]: total [ ${track.accumulator.toLocaleString('en-US')} ] ms`;

            if (full) {
                message += `, [ ${track.count.toLocaleString('en-US')} ] runs with [ ${Math.round(track.average * 1000) / 1000} ] ms in average`;
            }

            logger.info(message);
        }

        log(PerformanceTrackerCategory.SCRIPT);
        log(PerformanceTrackerCategory.DEMO_PACKETS_EXTRACT, true);
        log(PerformanceTrackerCategory.DEMO_PACKETS_DECOMPRESS, true);
        log(PerformanceTrackerCategory.MESSAGE_PACKETS_EXTRACT, true);

        logger.info(`----- </PerformanceTracker> -----`);
    }

    static instance = new PerformanceTracker();
}

module.exports = PerformanceTracker.instance;

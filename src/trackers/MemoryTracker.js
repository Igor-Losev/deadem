'use strict';

const process = require('process');

const Tracker = require('./Tracker');

const INTERVAL_MILLISECONDS = 10;
const MEGABYTE = 1024 * 1024;

class MemoryTracker extends Tracker {
    /**
     * @constructor
     * @param {Logger} logger
     */
    constructor(logger) {
        super(logger);

        this._statistics = {
            maxMemoryUsage: -Infinity
        };

        this._interval = setInterval(() => {
            const memoryUsage = process.memoryUsage.rss();

            if (memoryUsage > this._statistics.maxMemoryUsage) {
                this._statistics.maxMemoryUsage = memoryUsage;
            }
        }, INTERVAL_MILLISECONDS);
    }

    dispose() {
        super.dispose();

        clearInterval(this._interval);

        this._interval = null;
    }

    print() {
        const open = this._highlight('<MemoryTracker>');
        const close = this._highlight('</MemoryTracker>');

        this._logger.info(open);

        this._logger.info(`Max Memory Usage: [ ${this._formatNumber(this._statistics.maxMemoryUsage / MEGABYTE)} ] MB`);

        this._logger.info(close);
    }
}

module.exports = MemoryTracker;

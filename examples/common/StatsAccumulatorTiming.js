import StatsAccumulator from './StatsAccumulator.js'

class StatsAccumulatorTiming extends StatsAccumulator {
    /**
     * @public
     * @constructor
     */
    constructor() {
        super();

        this._started = false;
        this._startedAt = null;
    }

    /**
     * @public
     */
    start() {
        if (this._started) {
            throw new Error('Unable to run Timing.start()');
        }

        this._started = true;
        this._startedAt = Date.now();
    }

    /**
     * @public
     * @returns {number}
     */
    end() {
        if (!this._started) {
            throw new Error('Unable to run Timing.end()');
        }

        const difference = Date.now() - this._startedAt;

        this._started = false;
        this._startedAt = null;

        this._push(difference);

        return difference;
    }
}

export default StatsAccumulatorTiming;

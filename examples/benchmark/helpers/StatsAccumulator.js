class StatsAccumulator {
    /**
     * @public
     * @constructor
     */
    constructor() {
        this._measures = [ ];

        this._tCount = 0;
        this._tMean = 0;
        this._tM2 = 0;

        this._tMax = null;
        this._tMin = null;
    }

    /**
     * Accumulates stats and resets measures.
     *
     * @public
     */
    calculate() {
        if (this._measures.length === 0) {
            return;
        }

        const mCount = this._measures.length;
        const mMax = this._getMeasuresMax();
        const mMin = this._getMeasuresMin();
        const mMean = this._getMeasuresMean();
        const mM2 = this._getMeasuresM2();

        const tCount = this._tCount;
        const tMax = this._tMax;
        const tMin = this._tMin;
        const tMean = this._tMean;

        if (tMin === null || mMin < tMin) {
            this._tMin = mMin;
        }

        if (tMax === null || mMax > tMax) {
            this._tMax = mMax;
        }

        const delta = mMean - tMean;

        this._tCount = mCount + tCount;
        this._tMean = ((tMean * tCount) + (mMean * mCount)) / (mCount + tCount);
        this._tM2 += mM2 + Math.pow(delta, 2) * tCount * mCount / (mCount + tCount);

        this._measures = [ ];
    }

    /**
     * @public
     * @returns {number}
     */
    getCount() {
        return this._tCount;
    }

    /**
     * @public
     * @returns {number}
     */
    getMean() {
        return this._tMean;
    }

    /**
     * @public
     * @returns {StatsAccumulatorResult}
     */
    getResult() {
        return {
            count: this._tCount,
            max: this._tMax,
            mean: this._tMean,
            min: this._tMin,
            std: this.getStandardDeviation()
        };
    }

    /**
     * @public
     * @returns {number}
     */
    getStandardDeviation() {
        if (this._tCount < 2) {
            return 0;
        }

        return Math.sqrt(this._tM2 / (this._tCount - 1));
    }

    /**
     * @public
     * @param {number} value
     */
    push(value) {
        this._push(value);
    }

    /**
     * @protected
     * @returns {number}
     */
    _getMeasuresM2() {
        const mMean = this._getMeasuresMean();

        return this._measures.reduce((sum, m) => sum + Math.pow(m - mMean, 2), 0);
    }

    /**
     * @protected
     * @returns {number}
     */
    _getMeasuresMax() {
        return this._measures.reduce((max, m) => Math.max(max, m), -Infinity);
    }

    /**
     * @protected
     * @returns {number}
     */
    _getMeasuresMin() {
        return this._measures.reduce((min, m) => Math.min(min, m), +Infinity);
    }

    /**
     * @protected
     * @returns {number}
     */
    _getMeasuresMean() {
        return this._getMeasuresSum() / this._measures.length;
    }

    /**
     * @protected
     * @returns {number}
     */
    _getMeasuresSum() {
        return this._measures.reduce((sum, m) => sum + m, 0);
    }

    /**
     * @protected
     * @param {number} value
     */
    _push(value) {
        this._measures.push(value);
    }
}

/**
 * @typedef {{std: number, mean: number, count: number}} StatsAccumulatorResult
 */

export default StatsAccumulator;

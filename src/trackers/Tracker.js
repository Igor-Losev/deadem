import Assert from './../core/Assert.js';
import Logger from './../core/Logger.js';

class Tracker {
    /**
     * @abstract
     * @constructor
     * @param {Logger} logger
     */
    constructor(logger) {
        Assert.isTrue(logger instanceof Logger)

        this._logger = logger;
    }

    /**
     * @public
     */
    dispose() {

    }

    /**
     * @public
     */
    print() {
        throw new Error('Tracker.print() not implemented');
    }

    /**
     * @protected
     * @param {number} n
     * @returns {String}
     */
    _formatNumber(n) {
        return n.toLocaleString('ru-RU');
    }

    /**
     * @protected
     * @param {String} text
     * @returns {String}
     */
    _highlight(text) {
        Assert.isTrue(typeof text === 'string')

        return `----- ${text} -----`;
    }
}

export default Tracker;

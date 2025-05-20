'use strict';

const assert = require('assert');

class Tracker {
    /**
     * @abstract
     * @constructor
     * @param {Logger} logger
     */
    constructor(logger) {
        assert(logger instanceof Object);

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
        assert(typeof text === 'string');

        return `----- ${text} -----`;
    }
}

module.exports = Tracker;

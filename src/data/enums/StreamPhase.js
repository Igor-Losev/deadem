'use strict';

const assert = require('node:assert/strict');

const registry = {
    byCode: new Map()
};

class StreamPhase {
    /**
     * @private
     * @constructor
     * @param {String} code
     * @param {Number} order
     */
    constructor(code, order) {
        assert(typeof code === 'string' && code.length > 0);
        assert(Number.isInteger(order) && order >= 0);

        this._code = code;
        this._order = order;

        registry.byCode.set(code, this);
    }

    get code() {
        return this._code;
    }

    get order() {
        return this._order;
    }

    /**
     * @public
     * @static
     * @returns {StreamPhase}
     */
    static get ANALYZE() {
        return analyze;
    }

    /**
     * @public
     * @static
     * @returns {StreamPhase}
     */
    static get BATCH() {
        return batch;
    }

    /**
     * @public
     * @static
     * @returns {StreamPhase}
     */
    static get COORDINATE() {
        return coordinate;
    }

    /**
     * @public
     * @static
     * @returns {StreamPhase}
     */
    static get EXTRACT() {
        return extract;
    }

    /**
     * @public
     * @static
     * @returns {StreamPhase}
     */
    static get PARSE() {
        return parse;
    }

    /**
     * @public
     * @static
     * @returns {StreamPhase}
     */
    static get READ() {
        return read;
    }
}

const analyze = new StreamPhase('ANALYZE', 5);
const batch = new StreamPhase('BATCH', 2);
const coordinate = new StreamPhase('COORDINATE', 4);
const extract = new StreamPhase('EXTRACT', 1);
const parse = new StreamPhase('PARSE', 3);
const read = new StreamPhase('READ', 0);

module.exports = StreamPhase;

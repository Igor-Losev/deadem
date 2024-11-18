'use strict';

const assert = require('node:assert/strict');

class Server {
    /**
     * @public
     * @constructor
     * @param {Number} maxClasses
     * @param {Number} maxClients
     */
    constructor(maxClasses, maxClients) {
        assert(Number.isInteger(maxClasses));
        assert(Number.isInteger(maxClients));

        this._maxClasses = maxClasses;
        this._maxClients = maxClients;

        this._classIdSizeBits = Math.floor(Math.log2(maxClasses)) + 1;
    }

    get classIdSizeBits() {
        return this._classIdSizeBits;
    }

    get maxClasses() {
        return this._maxClasses;
    }

    get maxClients() {
        return this._maxClients;
    }
}

module.exports = Server;

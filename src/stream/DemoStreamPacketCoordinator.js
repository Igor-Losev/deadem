'use strict';

const Stream = require('stream');

class DemoStreamPacketCoordinator extends Stream.Transform {
    /**
     * @public
     * @constructor
     * @param {Parser} parser
     */
    constructor(parser) {
        super({ objectMode: true });

        this._parser = parser;
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    _transform(demoPacket, encoding, callback) {
        this.push(demoPacket);

        callback();
    }
}

module.exports = DemoStreamPacketCoordinator;

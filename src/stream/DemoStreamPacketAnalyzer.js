'use strict';

const Stream = require('stream');

class DemoStreamPacketAnalyzer extends Stream.Transform {
    constructor() {
        super({ objectMode: true });
    }

    /**
     * @private
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    _transform(demoPacket, encoding, callback) {
        callback();
    }
}

module.exports = DemoStreamPacketAnalyzer;

'use strict';

const Stream = require('stream');

class DemoStreamPacketCoordinator extends Stream.Transform {
    constructor() {
        super({ objectMode: true });
    }

    _transform(demoPacket, encoding, callback) {
        this.push(demoPacket);

        callback();
    }
}

module.exports = DemoStreamPacketCoordinator;

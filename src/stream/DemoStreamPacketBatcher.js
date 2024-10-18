const Stream = require('stream');

class DemoStreamPacketBatcher extends Stream.Transform {
    constructor() {
        super({ objectMode: true });
    }
}

module.exports = DemoStreamPacketBatcher;

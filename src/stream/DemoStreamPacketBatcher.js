const Stream = require('stream');

class DemoStreamPacketBatcher extends Stream.Transform {
    /**
     * @public
     * @constructor
     *
     * @param {Number} thresholdSizeBytes
     * @param {Number} thresholdWaitMilliseconds
     */
    constructor(thresholdSizeBytes, thresholdWaitMilliseconds) {
        super({ objectMode: true });

        this._thresholdSizeBytes = thresholdSizeBytes;
        this._thresholdWaitMilliseconds = thresholdWaitMilliseconds;

        this._timeoutId = null;

        this._batch = {
            packets: [ ],
            size: 0
        };
    }

    _flush(callback) {
        this._send();

        callback();
    }

    _transform(demoPacket, encoding, callback) {
        if (this._timeoutId !== null) {
            clearTimeout(this._timeoutId);

            this._timeoutId = null;
        }

        this._batch.packets.push(demoPacket);
        this._batch.size += demoPacket.getActualSize();

        if (this._batch.size >= this._thresholdSizeBytes) {
            this._send();
        } else {
            this._timeoutId = setTimeout(() => {
                this._send();
            }, this._thresholdWaitMilliseconds);
        }

        callback();
    }

    _send() {
        if (this._timeoutId !== null) {
            clearTimeout(this._timeoutId);

            this._timeoutId = null;
        }

        if (this._batch.packets.length === 0) {
            return;
        }

        const packets = this._batch.packets;

        this._batch.packets = [ ];
        this._batch.size = 0;

        this.push(packets);
    }
}

module.exports = DemoStreamPacketBatcher;

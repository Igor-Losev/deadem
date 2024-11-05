'use strict';

const Stream = require('stream');

const StringTable = require('../data/tables/string/StringTable'),
    StringTableContainer = require('../data/tables/string/StringTableContainer');

class DemoStreamPacketAnalyzer extends Stream.Transform {
    constructor() {
        super({ objectMode: true });

        this._stringTableContainer = new StringTableContainer();
    }

    /**
     * @private
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    _transform(demoPacket, encoding, callback) {
        if (!Array.isArray(demoPacket.data)) {
            callback();

            return;
        }

        demoPacket.data.forEach((messagePacket) => {
            if (messagePacket === null) {
                return;
            }

            switch (messagePacket.type) {
                case 4:
                    break;
                case 40:
                    break;
                case 42:
                    break;
                case 44:
                    this._stringTableContainer.handleCreate(messagePacket.data);

                    break;
                case 45:
                    this._stringTableContainer.handleUpdate(messagePacket.data);

                    break;
                case 51:
                    this._stringTableContainer.handleClear();

                    break;
                case 55:
                    break;
                case 300:
                    break;
                default:
                    break;
            }
        });

        callback();
    }
}

module.exports = DemoStreamPacketAnalyzer;

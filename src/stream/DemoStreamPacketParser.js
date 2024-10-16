const Stream = require('stream');

const protobuf = require('protobufjs'),
    snappy = require('snappy');

const DemoPacketMessageParser = require('./../definitions/DemoPacketMessageParser'),
    PerformanceTrackerCategory = require('./../definitions/PerformanceTrackerCategory');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const PerformanceTracker = require('./../trackers/PerformanceTracker.instance');

const logger = LoggerProvider.getLogger('DemoStreamPacketParser');

class DemoStreamPacketExtractor extends Stream.Transform {
    constructor(protoPath) {
        super({ objectMode: true });

        this._counts = {
            packets: 0
        };

        this._proto = protobuf.loadSync(protoPath);
    }

    /**
     *
     * @param {DemoPacket} packet
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     * @private
     */
    _transform(packet, encoding, callback) {
        callback();
        return;

        let payload;

        if (packet.getIsCompressed()) {
            PerformanceTracker.start(PerformanceTrackerCategory.DEMO_PACKETS_DECOMPRESS);

            payload = snappy.uncompressSync(packet.payload);

            PerformanceTracker.end(PerformanceTrackerCategory.DEMO_PACKETS_DECOMPRESS);
        } else {
            payload = packet.payload;
        }

        const messageType = packet.getMessageType();

        const EDemoCommands = this._proto.getEnum('EDemoCommands');

        logger.debug(`[ ${++this._counts.packets} ] - Tick: [ ${packet.tick.value} ], Command [ ${packet.command.value} ], MessageType: [ ${messageType} ], Size [ ${packet.payload.length} ], Compressed: [ ${packet.getIsCompressed()} ]`);

        switch (messageType) {
            case EDemoCommands.DEM_FileHeader: {
                const CDemoFileHeader = this._proto.lookupType('CDemoFileHeader');

                const fileHeader = CDemoFileHeader.decode(payload);

                logger.info(fileHeader);

                break;
            }
            case EDemoCommands.DEM_Packet:
            case EDemoCommands.DEM_SignonPacket: {
                const CDemoPacket = this._proto.lookupType('CDemoPacket');

                PerformanceTracker.start(PerformanceTrackerCategory.DEMO_MESSAGES_PARSE);

                const { data } = CDemoPacket.decode(payload);

                const parser = new DemoPacketMessageParser(data);

                const messages = parser.getMessages();

                PerformanceTracker.end(PerformanceTrackerCategory.DEMO_MESSAGES_PARSE);

                break;
            }
            default: {
                break;
            }
        }

        callback();
    }
}

module.exports = DemoStreamPacketExtractor;

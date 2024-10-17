const Stream = require('stream');

const protobuf = require('protobufjs'),
    snappy = require('snappy');

const MessagePacketExtractor = require('./../data/MessagePacketExtractor');

const PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const PacketTracker = require('./../trackers/PacketTracker.instance'),
    PerformanceTracker = require('./../trackers/PerformanceTracker.instance');

const logger = LoggerProvider.getLogger('DemoStreamPacketParser');

class DemoStreamPacketParser extends Stream.Transform {
    constructor(protoPath) {
        super({ objectMode: true });

        this._counts = {
            packets: 0
        };

        this._proto = protobuf.loadSync(protoPath);
    }

    /**
     *
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     * @private
     */
    _transform(demoPacket, encoding, callback) {
        this._counts.packets += 1;

        let payload;

        PacketTracker.trackDemoPacket(demoPacket);

        if (demoPacket.getIsCompressed()) {
            PerformanceTracker.start(PerformanceTrackerCategory.DEMO_PACKETS_DECOMPRESS);

            payload = snappy.uncompressSync(demoPacket.payload);

            PerformanceTracker.end(PerformanceTrackerCategory.DEMO_PACKETS_DECOMPRESS);
        } else {
            payload = demoPacket.payload;
        }

        const commandType = demoPacket.getCommandType();

        const EDemoCommands = this._proto.getEnum('EDemoCommands');

        logger.debug(`[ ${this._counts.packets} ] - Tick: [ ${demoPacket.tick.value} ], Command Type [ ${commandType} ], Size [ ${demoPacket.payload.length} ], Compressed: [ ${demoPacket.getIsCompressed()} ]`);

        switch (commandType) {
            case EDemoCommands.DEM_FileHeader: {
                const CDemoFileHeader = this._proto.lookupType('CDemoFileHeader');

                const fileHeader = CDemoFileHeader.decode(payload);

                logger.info(fileHeader);

                break;
            }
            case EDemoCommands.DEM_Packet:
            case EDemoCommands.DEM_SignonPacket: {
                const CDemoPacket = this._proto.lookupType('CDemoPacket');

                const { data } = CDemoPacket.decode(payload);

                const extractor = new MessagePacketExtractor(data).retrieve();

                PerformanceTracker.start(PerformanceTrackerCategory.MESSAGE_PACKETS_EXTRACT);

                let messagePacket = extractor.next().value;

                while (messagePacket) {
                    PacketTracker.trackMessagePacket(demoPacket, messagePacket);

                    messagePacket = extractor.next().value;
                }

                PerformanceTracker.end(PerformanceTrackerCategory.MESSAGE_PACKETS_EXTRACT);

                break;
            }
            default: {
                break;
            }
        }

        callback();
    }
}

module.exports = DemoStreamPacketParser;

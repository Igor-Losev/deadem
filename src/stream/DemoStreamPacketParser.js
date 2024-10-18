const Stream = require('stream');

const snappy = require('snappy');

const MessagePacketExtractor = require('./../data/MessagePacketExtractor'),
    MessagePacketParser = require('./../data/MessagePacketParser');

const PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

const LoggerProvider = require('./../providers/LoggerProvider.instance'),
    ProtoProvider = require('./../providers/ProtoProvider.instance');

const PacketTracker = require('./../trackers/PacketTracker.instance'),
    PerformanceTracker = require('./../trackers/PerformanceTracker.instance');

const WorkerManager = require('./../workers/WorkerManager');

const logger = LoggerProvider.getLogger('DemoStreamPacketParser');

class DemoStreamPacketParser extends Stream.Transform {
    /**
     * @constructor
     * @public
     *
     * @param {Number} concurrency
     */
    constructor(concurrency) {
        super({ objectMode: true });

        this._counts = {
            packets: 0
        };

        this._workerManager = new WorkerManager(concurrency);
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

        const EDemoCommands = ProtoProvider.DEMO.getEnum('EDemoCommands');

        logger.debug(`[ ${this._counts.packets} ] - Tick: [ ${demoPacket.tick.value} ], Command Type [ ${commandType} ], Size [ ${demoPacket.payload.length} ], Compressed: [ ${demoPacket.getIsCompressed()} ]`);

        switch (commandType) {
            case EDemoCommands.DEM_FileHeader: { // 1
                const CDemoFileHeader = ProtoProvider.DEMO.lookupType('CDemoFileHeader');

                const fileHeader = CDemoFileHeader.decode(payload);

                logger.info(fileHeader);

                break;
            }
            case EDemoCommands.DEM_Packet: // 7
            case EDemoCommands.DEM_SignonPacket: { // 8
                const CDemoPacket = ProtoProvider.DEMO.lookupType('CDemoPacket');

                const { data } = CDemoPacket.decode(payload);

                console.log(demoPacket);
                console.log(data.length);

                const extractor = new MessagePacketExtractor(data).retrieve();

                PerformanceTracker.start(PerformanceTrackerCategory.MESSAGE_PACKETS_EXTRACT);

                for (const messagePacket of extractor) {
                    console.log(messagePacket);

                    PacketTracker.trackMessagePacket(demoPacket, messagePacket);

                    const messagePacketParser = new MessagePacketParser(messagePacket);

                    messagePacketParser.parse();
                }

                PerformanceTracker.end(PerformanceTrackerCategory.MESSAGE_PACKETS_EXTRACT);

                break;
            }
            default: {
                break;
            }
        }

        if (this._counts.packets === 4) {
            throw new Error(123);
        }

        callback();
    }
}

module.exports = DemoStreamPacketParser;

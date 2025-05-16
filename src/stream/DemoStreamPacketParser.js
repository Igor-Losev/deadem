'use strict';

const Stream = require('node:stream');

const DemoPacket = require('./../data/DemoPacket'),
    MessagePacket = require('./../data/MessagePacket');

const DemoCommandType = require('./../data/enums/DemoCommandType'),
    MessagePacketType = require('./../data/enums/MessagePacketType');

const SnappyDecompressor = require('./../decompressors/SnappyDecompressor.instance');

const MessagePacketRawExtractor = require('./../extractors/MessagePacketRawExtractor');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const WorkerRequestDHPParse = require('./../workers/requests/WorkerRequestDHPParse');

const logger = LoggerProvider.getLogger('DemoStreamPacketParser');

const HEAVY_PACKETS = [ DemoCommandType.DEM_PACKET, DemoCommandType.DEM_SIGNON_PACKET, DemoCommandType.DEM_FULL_PACKET ];

/**
 * Given a stream of {@link DemoPacketRaw}, parses its payload and
 * passes through instances of {@link DemoPacket}. Packets that
 * may hypothetically include large amounts of data (e.g. DEM_PACKET,
 * DEM_SIGNON_PACKET, DEM_FULL_PACKET) are processed through
 * asynchronous worker threads. As a result, the order of the {@link DemoPacket}
 * instances is not guaranteed.
 */
class DemoStreamPacketParser extends Stream.Transform {
    /**
     * @constructor
     * @public
     * @param {Parser} parser
     */
    constructor(parser) {
        super({ objectMode: true });

        this._parser = parser;

        this._counts = {
            batches: 0,
            requests: 0
        };

        this._pendingRequests = [ ];
    }

    /**
     * @protected
     * @async
     * @param {TransformCallback} callback
     * @returns {Promise<void>}
     */
    async _flush(callback) {
        await Promise.all(this._pendingRequests.map(m => m.promise));

        callback();
    }

    /**
     * @protected
     * @param {Array<DemoPacketRaw>} batch
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     * @private
     */
    async _transform(batch, encoding, callback) {
        this._counts.batches += 1;

        if (this._parser.workerManager === null) {
            this._processSync(batch);

            callback();
        } else {
            const getIsHeavy = demoPacketRaw => HEAVY_PACKETS.includes(DemoCommandType.parseById(demoPacketRaw.getCommandType()));
            const getIsOther = demoPacketRaw => !getIsHeavy(demoPacketRaw);

            const heavy = batch.filter(getIsHeavy);
            const other = batch.filter(getIsOther);

            this._processSync(other);

            if (heavy.length > 0) {
                const thread = await this._parser.workerManager.requestThread();

                this._processAsync(thread, heavy)
                    .then((demoPackets) => {
                        demoPackets.forEach((demoPacket) => {
                            this.push(demoPacket);
                        });
                    });
            }

            callback();
        }
    }

    /**
     * @protected
     * @param {Array<DemoPacketRaw>} packets
     */
    _processSync(packets) {
        packets.forEach((demoPacketRaw) => {
            const demoPacket = parseDemoPacket.call(this, demoPacketRaw);

            this.push(demoPacket);
        });
    }

    /**
     * @protected
     * @param {WorkerThread} thread
     * @param {Array<DemoPacketRaw>} packets
     * @returns {Promise<Array<DemoPacket>>}
     */
    _processAsync(thread, packets) {
        this._counts.requests += 1;

        const request = new WorkerRequestDHPParse(packets.map(p => p.payload));

        const promise = this._parser.workerManager.process(thread, request);

        this._pendingRequests.push({ request, promise });

        return promise
            .then((response) => {
                const taskIndex = this._pendingRequests.findIndex(({ request: r }) => r === request);

                if (taskIndex >= 0) {
                    this._pendingRequests.splice(taskIndex, 1);
                }

                const demoPackets = [ ];

                response.payload.forEach((batch, batchIndex) => {
                    const demoPacketRaw = packets[batchIndex];

                    const messagePackets = [ ];

                    batch.forEach((messagePacketRaw) => {
                        const messagePacket = parseMessagePacket.call(this, messagePacketRaw);

                        if (messagePacket !== null) {
                            messagePackets.push(messagePacket);
                        }
                    });

                    const demoCommandType = DemoCommandType.parseById(demoPacketRaw.getCommandType());
                    const demoTick = demoPacketRaw.tick.value;

                    const demoPacket = new DemoPacket(demoPacketRaw.sequence, demoCommandType, demoTick, messagePackets);

                    demoPackets.push(demoPacket);
                });

                return demoPackets;
            });
    }
}

/**
 * @param {DemoPacketRaw} demoPacketRaw
 * @returns {DemoPacket}
 */
function parseDemoPacket(demoPacketRaw) {
    let data;

    if (demoPacketRaw.getIsCompressed()) {
        data = SnappyDecompressor.decompress(demoPacketRaw.payload);
    } else {
        data = demoPacketRaw.payload;
    }

    const demoCommandType = DemoCommandType.parseById(demoPacketRaw.getCommandType());
    const demoTick = demoPacketRaw.tick.value;

    if (demoCommandType === null) {
        throw new Error(`Unable to parse DemoCommandType [ ${demoPacketRaw.getCommandType()} ]`);
    }

    const decoded = demoCommandType.proto.decode(data);

    let demoPacket;

    if (HEAVY_PACKETS.includes(demoCommandType)) {
        const extractor = new MessagePacketRawExtractor(decoded.data).retrieve();

        const messagePackets = [ ];

        for (const messagePacketRaw of extractor) {
            const messagePacket = parseMessagePacket.call(this, messagePacketRaw);

            if (messagePacket !== null) {
                messagePackets.push(messagePacket);
            }
        }

        demoPacket = new DemoPacket(demoPacketRaw.sequence, demoCommandType, demoTick, messagePackets);
    } else {
        demoPacket = new DemoPacket(demoPacketRaw.sequence, demoCommandType, demoTick, decoded);
    }

    return demoPacket;
}

/**
 * @param {MessagePacketRaw} messagePacketRaw
 * @returns {MessagePacket|null}
 */
function parseMessagePacket(messagePacketRaw) {
    const messagePacketType = MessagePacketType.parseById(messagePacketRaw.type) || null;

    if (messagePacketType === null) {
        this._parser.packetTracker.handleUnknownMessagePacket(messagePacketRaw.type);

        return null;
    }

    const data = messagePacketType.proto.decode(messagePacketRaw.payload);

    return new MessagePacket(messagePacketType, data);
}

module.exports = DemoStreamPacketParser;

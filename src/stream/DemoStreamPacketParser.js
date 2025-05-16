'use strict';

const Stream = require('node:stream');

const DemoPacket = require('./../data/DemoPacket'),
    MessagePacket = require('./../data/MessagePacket');

const DemoCommandType = require('./../data/enums/DemoCommandType'),
    MessagePacketType = require('./../data/enums/MessagePacketType');

const SnappyDecompressor = require('./../decompressors/SnappyDecompressor.instance');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const WorkerRequestDHPParse = require('./../workers/requests/WorkerRequestDHPParse');

const logger = LoggerProvider.getLogger('DemoStreamPacketParser');

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
            messages: 0
        };

        this._workerTargets = [ DemoCommandType.DEM_PACKET, DemoCommandType.DEM_SIGNON_PACKET, DemoCommandType.DEM_FULL_PACKET ];

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

        const getIsHeavy = demoPacketRaw => this._workerTargets.includes(DemoCommandType.parseById(demoPacketRaw.getCommandType()));
        const getIsOther = demoPacketRaw => !getIsHeavy(demoPacketRaw);

        const heavy = batch.filter(getIsHeavy);
        const other = batch.filter(getIsOther);

        other.forEach((demoPacketRaw) => {
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

            const demoPacket = new DemoPacket(demoPacketRaw.sequence, demoCommandType, demoTick, demoCommandType.proto.decode(data));

            this.push(demoPacket);
        });

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

    /**
     * @protected
     * @param {WorkerThread} thread
     * @param {Array<DemoPacketRaw>} packets
     * @returns {Promise<Array<DemoPacket>>}
     */
    _processAsync(thread, packets) {
        this._counts.messages += 1;

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
                        const messagePacketType = MessagePacketType.parseById(messagePacketRaw.type) || null;

                        if (messagePacketType === null) {
                            this._parser.packetTracker.handleUnknownMessagePacket(messagePacketRaw.type);

                            return;
                        }

                        const data = messagePacketType.proto.decode(messagePacketRaw.payload);

                        const messagePacket = new MessagePacket(messagePacketType, data);

                        messagePackets.push(messagePacket);
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

module.exports = DemoStreamPacketParser;

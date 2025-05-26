import Stream from 'node:stream';

import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';

import DemoPacket from './../data/DemoPacket.js';
import MessagePacket from './../data/MessagePacket.js';

import DemoPacketType from '../data/enums/DemoPacketType.js';
import MessagePacketType from './../data/enums/MessagePacketType.js';
import PerformanceTrackerCategory from './../data/enums/PerformanceTrackerCategory.js';

import MessagePacketRawExtractor from '#extractors/MessagePacketRawExtractor.js';

import WorkerRequestDHPParse from './../workers/requests/WorkerRequestDHPParse.js';

const HEAVY_PACKETS = [ DemoPacketType.DEM_PACKET, DemoPacketType.DEM_SIGNON_PACKET, DemoPacketType.DEM_FULL_PACKET ];

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
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super({ objectMode: true });

        this._engine = engine;

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

        if (!this._engine.getIsMultiThreaded()) {
            this._engine.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

            const demoPackets = this._processSync(batch);

            this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

            demoPackets.forEach((demoPacket) => {
                this.push(demoPacket);
            });

            callback();
        } else {
            const getIsHeavy = demoPacketRaw => HEAVY_PACKETS.includes(DemoPacketType.parseById(demoPacketRaw.getTypeId()));
            const getIsOther = demoPacketRaw => !getIsHeavy(demoPacketRaw);

            const heavy = batch.filter(getIsHeavy);
            const other = batch.filter(getIsOther);

            const demoPackets = this._processSync(other);

            demoPackets.forEach((demoPacket) => {
                this.push(demoPacket);
            });

            if (heavy.length > 0) {
                const thread = await this._engine.workerManager.allocate();

                this._processAsync(thread, heavy)
                    .then((demoPackets) => {
                        this._engine.workerManager.free(thread);

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
     * @returns {Array<DemoPacket>}
     */
    _processSync(packets) {
        return packets.map(demoPacketRaw => parseDemoPacket.call(this, demoPacketRaw));
    }

    /**
     * @protected
     * @param {WorkerThread} thread
     * @param {Array<DemoPacketRaw>} packets
     * @returns {Promise<Array<DemoPacket>>}
     */
    async _processAsync(thread, packets) {
        this._counts.requests += 1;

        const request = new WorkerRequestDHPParse(packets.map(p => p.payload));

        const promise = thread.send(request);

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

                    const demoPacketType = DemoPacketType.parseById(demoPacketRaw.getTypeId());
                    const demoTick = demoPacketRaw.tick.value;

                    const demoPacket = new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoTick, messagePackets);

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

    const demoPacketType = DemoPacketType.parseById(demoPacketRaw.getTypeId());
    const demoTick = demoPacketRaw.tick.value;

    if (demoPacketType === null) {
        throw new Error(`Unable to parse DemoPacketType [ ${demoPacketRaw.getTypeId()} ]`);
    }

    const decoded = demoPacketType.proto.decode(data);

    let demoPacket;

    if (HEAVY_PACKETS.includes(demoPacketType)) {
        const extractor = new MessagePacketRawExtractor(decoded.data);

        const messagePacketsRaw = extractor.all();
        const messagePackets = [ ];

        messagePacketsRaw.forEach((messagePacketRaw) => {
            const messagePacket = parseMessagePacket.call(this, messagePacketRaw);

            if (messagePacket !== null) {
                messagePackets.push(messagePacket);
            }
        });

        demoPacket = new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoTick, messagePackets);
    } else {
        demoPacket = new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoTick, decoded);
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
        this._engine.getPacketTracker().handleUnknownMessagePacket(messagePacketRaw.type);

        return null;
    }

    let data;

    try {
        data = messagePacketType.proto.decode(messagePacketRaw.payload);
    } catch {
        this._engine.logger.warn(`Unable to decode protobuf message for [ ${messagePacketType.code} ]`);

        return null;
    }

    return new MessagePacket(messagePacketType, data);
}

export default DemoStreamPacketParser;

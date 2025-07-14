import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';
import TransformStream from '#core/stream/TransformStream.js';

import DemoPacket from '#data/DemoPacket.js';
import MessagePacket from '#data/MessagePacket.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import MessagePacketType from '#data/enums/MessagePacketType.js';
import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';

import MessagePacketRawExtractor from '#extractors/MessagePacketRawExtractor.js';

import WorkerRequestDHPParse from '#workers/requests/WorkerRequestDHPParse.js';

/**
 * Given a stream of {@link DemoPacketRaw}, parses its payload and
 * passes through instances of:
 *  - {@link DemoPacket} - in case of success.
 *  - {@link DemoPacketRaw} - in case of failure.
 * Packets that may hypothetically include large amounts of data (e.g. DEM_PACKET,
 * DEM_SIGNON_PACKET, DEM_FULL_PACKET) are processed through
 * asynchronous worker threads. As a result, the order of the {@link DemoPacket}
 * or {@link DemoPacketRaw} instances is not guaranteed.
 */
class DemoStreamPacketParser extends TransformStream {
    /**
     * @constructor
     * @public
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super();

        this._engine = engine;

        this._counts = {
            batches: 0,
            requests: 0
        };

        this._pendingRequests = [ ];
    }

    /**
     * @protected
     * @returns {Promise<void>}
     */
    async _finalize() {
        const wait = async () => {
            await Promise.all(this._pendingRequests);

            if (this._pendingRequests.length > 0) {
                await wait();
            }
        };

        await wait();
    }

    /**
     * @protected
     * @param {Array<DemoPacketRaw>} batch
     */
    async _handle(batch) {
        this._counts.batches += 1;

        if (!this._engine.getIsMultiThreaded()) {
            this._engine.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

            const demoPackets = this._processSync(batch);

            this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_PARSER);

            demoPackets.forEach((demoPacket, index) => {
                if (demoPacket !== null) {
                    this._push(demoPacket);
                } else {
                    this._push(batch[index]);
                }
            });
        } else {
            const getIsHeavy = demoPacketRaw => DemoPacketType.parseById(demoPacketRaw.getTypeId())?.heavy;
            const getIsOther = demoPacketRaw => !getIsHeavy(demoPacketRaw);

            const heavy = batch.filter(getIsHeavy);
            const other = batch.filter(getIsOther);

            const demoPackets = this._processSync(other);

            demoPackets.forEach((demoPacket, index) => {
                if (demoPacket !== null) {
                    this._push(demoPacket);
                } else {
                    this._push(batch[index]);
                }
            });

            if (heavy.length > 0) {
                const promise = this._engine.workerManager.allocate();

                this._pendingRequests.push(promise);

                const thread = await promise;

                this._removePending(promise);

                this._processAsync(thread, heavy)
                    .then((demoPackets) => {
                        this._engine.workerManager.free(thread);

                        demoPackets.forEach((demoPacket) => {
                            this._push(demoPacket);
                        });
                    });
            }
        }
    }

    /**
     * @protected
     * @param {Array<DemoPacketRaw>} packets
     * @returns {Array<DemoPacket|null>}
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

        const promise = thread.send(new WorkerRequestDHPParse(packets.map(p => [ p.getIsCompressed(), p.payload ])));

        this._pendingRequests.push(promise);

        return promise
            .then((response) => {
                this._removePending(promise);

                const demoPackets = [ ];

                response.payload.forEach((batch, batchIndex) => {
                    const demoPacketRaw = packets[batchIndex];

                    const messagePackets = [ ];

                    batch.forEach((messagePacketRaw) => {
                        const messagePacket = parseMessagePacket.call(this, messagePacketRaw);

                        if (messagePacket !== null) {
                            messagePackets.push(messagePacket);
                        } else {
                            this._engine.getPacketTracker().handleMessagePacketRaw(demoPacketRaw, messagePacketRaw);
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

    /**
     * @protected
     * @param {Promise<any>} promise
     */
    _removePending(promise) {
        const index = this._pendingRequests.findIndex(p => promise === p);

        if (index >= 0) {
            this._pendingRequests.splice(index, 1);
        }
    }
}

/**
 * @param {DemoPacketRaw} demoPacketRaw
 * @returns {DemoPacket|null}
 */
function parseDemoPacket(demoPacketRaw) {
    const demoPacketTypeId = demoPacketRaw.getTypeId();
    const demoPacketType = DemoPacketType.parseById(demoPacketTypeId);

    if (demoPacketType === null) {
        this._engine.logger.warn(`Unknown DemoPacketType [ ${demoPacketTypeId} ]`);

        return null;
    }

    let data;

    if (demoPacketRaw.getIsCompressed()) {
        data = SnappyDecompressor.decompress(demoPacketRaw.payload);
    } else {
        data = demoPacketRaw.payload;
    }

    const decoded = demoPacketType.proto.decode(data);

    let demoPacket;

    if (demoPacketType.heavy) {
        const messagePackets = parseMessagePackets.call(this, demoPacketRaw, decoded.data);

        demoPacket = new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoPacketRaw.tick.value, messagePackets);
    } else if (demoPacketType === DemoPacketType.DEM_FULL_PACKET) {
        const messagePackets = parseMessagePackets.call(this, demoPacketRaw, decoded.packet.data);

        demoPacket = new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoPacketRaw.tick.value, { messagePackets, stringTables: decoded.stringTable });
    } else {
        demoPacket = new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoPacketRaw.tick.value, decoded);
    }

    return demoPacket;
}

/**
 * @param {Buffer} data
 * @param {DemoPacketRaw} demoPacketRaw
 * @returns {Array<MessagePacket>}
 */
function parseMessagePackets(demoPacketRaw, data) {
    const extractor = new MessagePacketRawExtractor(data);

    const messagePacketsRaw = extractor.all();
    const messagePackets = [ ];

    messagePacketsRaw.forEach((messagePacketRaw) => {
        const messagePacket = parseMessagePacket.call(this, messagePacketRaw);

        if (messagePacket !== null) {
            messagePackets.push(messagePacket);
        } else {
            this._engine.getPacketTracker().handleMessagePacketRaw(demoPacketRaw, messagePacketRaw);
        }
    });

    return messagePackets;
}

/**
 * @param {MessagePacketRaw} messagePacketRaw
 * @returns {MessagePacket|null}
 */
function parseMessagePacket(messagePacketRaw) {
    const messagePacketType = MessagePacketType.parseById(messagePacketRaw.type) || null;

    if (messagePacketType === null) {
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

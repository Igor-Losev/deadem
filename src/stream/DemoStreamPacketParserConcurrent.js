import TransformStream from '#core/stream/TransformStream.js';

import DemoPacket from '#data/DemoPacket.js';
import MessagePacket from '#data/MessagePacket.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';

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
class DemoStreamPacketParserConcurrent extends TransformStream {
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

        const getIsHeavy = demoPacketRaw => DemoPacketType.parseById(demoPacketRaw.getTypeId())?.heavy;
        const getIsOther = demoPacketRaw => !getIsHeavy(demoPacketRaw);

        const heavy = batch.filter(getIsHeavy);
        const other = batch.filter(getIsOther);

        if (other.length > 0) {
            other.forEach((demoPacketRaw) => {
                const demoPacket = DemoPacket.parse(demoPacketRaw);

                if (demoPacket === null) {
                    this._engine.getPacketTracker().handleDemoPacketRaw(demoPacketRaw);

                    this._push(demoPacketRaw);
                } else {
                    this._push(demoPacket);
                }
            });
        }

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

    /**
     * @protected
     * @param {WorkerThread} thread
     * @param {Array<DemoPacketRaw>} packets
     * @returns {Promise<Array<DemoPacket>>}
     */
    async _processAsync(thread, packets) {
        this._counts.requests += 1;

        const promise = thread.send(new WorkerRequestDHPParse(packets.map(p => [ p.getTypeId(), p.getIsCompressed(), p.payload ])));

        this._pendingRequests.push(promise);

        return promise
            .then((response) => {
                this._removePending(promise);

                const demoPackets = [ ];

                response.payload.batches.forEach((batch, batchIndex) => {
                    const demoPacketRaw = packets[batchIndex];
                    const stringTables = response.payload.stringTables[batchIndex];

                    const messagePackets = [ ];

                    batch.forEach((messagePacketRaw) => {
                        const messagePacket = MessagePacket.parse(messagePacketRaw);

                        if (messagePacket === null) {
                            this._engine.getPacketTracker().handleMessagePacketRaw(demoPacketRaw, messagePacketRaw);
                        } else {
                            messagePackets.push(messagePacket);
                        }
                    });

                    const demoPacketType = DemoPacketType.parseById(demoPacketRaw.getTypeId());
                    const demoTick = demoPacketRaw.tick.value;

                    const demoPacket = new DemoPacket(demoPacketRaw.sequence, demoPacketType, demoTick, createDemoPacketData(messagePackets, stringTables));

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
 * @param {Array<MessagePacket|MessagePacketRaw>} messagePackets
 * @param {CDemoStringTables|null} stringTables
 */
function createDemoPacketData(messagePackets, stringTables = null) {
    return {
        messagePackets,
        stringTables
    };
}

export default DemoStreamPacketParserConcurrent;


import Stream from 'node:stream';

import DeferredPromise from '#data/DeferredPromise.js';

import EntityMutation from '#data/entity/EntityMutation.js';
import EntityMutationEvent from '#data/entity/EntityMutationEvent.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import EntityOperation from '#data/enums/EntityOperation.js';
import InterceptorStage from '#data/enums/InterceptorStage.js';
import MessagePacketType from '#data/enums/MessagePacketType.js';

import FieldPathBuilder from '#data/fields/path/FieldPathBuilder.js';

import DemoEntityHandler from '#handlers/DemoEntityHandler.js';
import DemoMessageHandler from '#handlers/DemoMessageHandler.js';
import DemoPacketHandler from '#handlers/DemoPacketHandler.js';

import WorkerRequestDPacketSync from '#workers/requests/WorkerRequestDPacketSync.js';
import WorkerRequestSvcCreatedEntities from '#workers/requests/WorkerRequestSvcCreatedEntities.js';
import WorkerRequestSvcUpdatedEntities from '#workers/requests/WorkerRequestSvcUpdatedEntities.js';

class DemoStreamPacketAnalyzerConcurrent extends Stream.Transform {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super({ objectMode: true });

        this._engine = engine;

        this._demoEntityHandler = new DemoEntityHandler(engine.demo);
        this._demoMessageHandler = new DemoMessageHandler(engine.demo);
        this._demoPacketHandler = new DemoPacketHandler(engine.demo);

        this._queue = [ ];
    }

    /**
     * @protected
     * @param {TransformCallback} callback
     */
    async _flush(callback) {
        await Promise.all(this._queue.filter(i => i.deferred !== null).map(i => i.deferred.promise));

        callback();
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    async _transform(demoPacket, encoding, callback) {
        if (!demoPacket.type.heavy) {
            this._enqueue(demoPacket);

            await this._drain();

            callback();

            return;
        }

        const packets = demoPacket.data.filter(messagePacket => messagePacket.type === MessagePacketType.SVC_PACKET_ENTITIES);

        if (packets.length === 0) {
            this._enqueue(demoPacket);

            await this._drain();

            callback();

            return;
        }

        if (packets.length !== 1) {
            throw new Error(`Unhandled: the amount of SVC_PACKET_ENTITIES packets is more than one - [ ${packets.length} ]`);
        }

        const packet = packets[0];

        const thread = await this._engine.workerManager.allocate();

        const deferred = new DeferredPromise();

        thread.send(new WorkerRequestSvcUpdatedEntities(packet))
            .then((response) => {
                this._engine.workerManager.free(thread);

                deferred.resolve(response);
            }).catch((error) => {
                deferred.reject(error);
            });

        this._enqueue(demoPacket, deferred);

        await this._drain();

        callback();
    }

    /**
     * @protected
     * @returns {Promise<void>}
     */
    async _drain() {
        if (this._queue.length === 0) {
            return;
        }

        let i = -1;

        while (i + 1 < this._queue.length) {
            const item = this._queue[i + 1];

            if (item.deferred !== null && !item.deferred.fulfilled) {
                break;
            }

            i++;

            await this._handlePacket(item.demoPacket, item.deferred);
        }

        if (i >= 0) {
            this._queue = this._queue.slice(i + 1);
        }
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {DeferredPromise|null} deferred
     */
    _enqueue(demoPacket, deferred = null) {
        this._queue.push({ demoPacket, deferred });
    }

    async _handlePacket(demoPacket, deferred) {
        await this._engine.interceptPre(InterceptorStage.DEMO_PACKET, demoPacket);

        switch (demoPacket.type) {
            case DemoPacketType.DEM_SEND_TABLES:
                this._demoPacketHandler.handleDemSendTables(demoPacket);

                await this._engine.workerManager.broadcast(new WorkerRequestDPacketSync(demoPacket));

                break;
            case DemoPacketType.DEM_CLASS_INFO:
                this._demoPacketHandler.handleDemClassInfo(demoPacket);

                await this._engine.workerManager.broadcast(new WorkerRequestDPacketSync(demoPacket));

                break;
            case DemoPacketType.DEM_STRING_TABLES:
                this._demoPacketHandler.handleDemStringTables(demoPacket);

                break;
            case DemoPacketType.DEM_FULL_PACKET:
            case DemoPacketType.DEM_PACKET:
            case DemoPacketType.DEM_SIGNON_PACKET: {
                const messagePackets = demoPacket.data;

                for (let i = 0; i < messagePackets.length; i++) {
                    const messagePacket = messagePackets[i];

                    await this._engine.interceptPre(InterceptorStage.MESSAGE_PACKET, demoPacket, messagePacket);

                    switch (messagePacket.type) {
                        case MessagePacketType.SVC_SERVER_INFO:
                            this._demoMessageHandler.handleSvcServerInfo(messagePacket);

                            break;
                        case MessagePacketType.SVC_CREATE_STRING_TABLE:
                            this._demoMessageHandler.handleSvcCreateStringTable(messagePacket);

                            break;
                        case MessagePacketType.SVC_UPDATE_STRING_TABLE:
                            this._demoMessageHandler.handleSvcUpdateStringTable(messagePacket);

                            break;
                        case MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES:
                            this._demoMessageHandler.handleSvcClearAllStringTables(messagePacket);

                            break;
                        case MessagePacketType.SVC_PACKET_ENTITIES: {
                            const response = await deferred.promise;

                            const { events, lastIndex } = this._getEntityEvents(demoPacket, messagePacket, response.payload);

                            const created = [];

                            for (let i = lastIndex; i < events.length; i++) {
                                if (events[i].operation === EntityOperation.CREATE) {
                                    created.push(events[i]);
                                }
                            }

                            if (created.length > 0) {
                                this._broadcastCreatedEntities(created);
                            }

                            await this._engine.interceptPre(InterceptorStage.ENTITY_PACKET, demoPacket, messagePacket, events);

                            this._handleEntityEvents(events);

                            await this._engine.interceptPost(InterceptorStage.ENTITY_PACKET, demoPacket, messagePacket, events);

                            break;
                        }
                    }

                    this._engine.getPacketTracker().handleMessagePacket(demoPacket, messagePacket);

                    await this._engine.interceptPost(InterceptorStage.MESSAGE_PACKET, demoPacket, messagePacket);
                }

                break;
            }
            default:
                break;
        }

        this._engine.getPacketTracker().handleDemoPacket(demoPacket);

        await this._engine.interceptPost(InterceptorStage.DEMO_PACKET, demoPacket);
    }

    /**
     * @protected
     * @param {Array<EntityMutationEvent>} events
     */
    _broadcastCreatedEntities(events) {
        const step = 3;
        const createdData = new Uint32Array(events.length * step);

        for (let i = 0; i < events.length; i++) {
            const event = events[i];

            createdData[i * step] = event.entity.index;
            createdData[i * step + 1] = event.entity.serial;
            createdData[i * step + 2] = event.entity.class.id;
        }

        this._engine.workerManager.broadcast(new WorkerRequestSvcCreatedEntities(createdData));
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {MessagePacket} messagePacket
     * @param {Array<EntityMutationPartialEvent>} partial
     * @returns {Array<EntityMutationEvent>}
     */
    _getEntityEvents(demoPacket, messagePacket, partial) {
        if (partial.length === 0) {
            return {
                events: this._demoMessageHandler.handleSvcPacketEntities(messagePacket),
                lastIndex: 0
            };
        }

        const events = [ ];

        let i = -1;

        for (; i < partial.length - 1; i += 1) {
            const eventPartial = partial[i + 1];

            const entity = this._engine.demo.getEntity(eventPartial.entityIndex) || null;

            if (entity === null || entity.class.id !== eventPartial.entityClassId) {
                break;
            }

            const mutations = [ ];

            for (let i = 0; i < eventPartial.mutations.length; i += 2) {
                const fieldPath = FieldPathBuilder.reconstruct(eventPartial.mutations[i]);

                mutations.push(new EntityMutation(fieldPath, eventPartial.mutations[i + 1]));
            }

            events.push(new EntityMutationEvent(EntityOperation.UPDATE, entity, mutations));
        }

        if (i < 0) {
            return {
                events: this._demoMessageHandler.handleSvcPacketEntities(messagePacket),
                lastIndex: 0
            };
        }

        const last = partial[i];

        return {
            events: [
                ...events,
                ...this._demoMessageHandler.handleSvcPacketEntities(messagePacket, last.bitPointer, i + 1, last.entityIndex)
            ],
            lastIndex: i
        };
    }

    /**
     * @protected
     * @param {Array<EntityMutationEvent>} events
     */
    _handleEntityEvents(events) {
        this._demoEntityHandler.handleEntityEvents(events);
    }
}

export default DemoStreamPacketAnalyzerConcurrent;

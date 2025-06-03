import Stream from 'node:stream';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import EntityOperation from '#data/enums/EntityOperation.js';
import InterceptorStage from '#data/enums/InterceptorStage.js';
import MessagePacketType from '#data/enums/MessagePacketType.js';
import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';

import DemoPacketHandler from '#handlers/DemoPacketHandler.js';
import DemoMessageHandler from '#handlers/DemoMessageHandler.js';

/**
 * Given a stream of {@link DemoPacket}, processes them sequentially,
 * updating the state of the {@link Demo} accordingly.
 */
class DemoStreamPacketAnalyzer extends Stream.Transform {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super({ objectMode: true });

        this._engine = engine;

        this._demoPacketHandler = new DemoPacketHandler(engine.demo);
        this._demoMessageHandler = new DemoMessageHandler(engine.demo);
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    async _transform(demoPacket, encoding, callback) {
        await this._interceptPre(InterceptorStage.DEMO_PACKET, demoPacket);

        this._engine.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_PACKET_ANALYZER);

        switch (demoPacket.type) {
            case DemoPacketType.DEM_SEND_TABLES: {
                this._demoPacketHandler.handleDemSendTables(demoPacket);

                break;
            }
            case DemoPacketType.DEM_CLASS_INFO: {
                this._demoPacketHandler.handleDemClassInfo(demoPacket);

                break;
            }
            case DemoPacketType.DEM_STRING_TABLES:
                this._demoPacketHandler.handleDemStringTables(demoPacket);

                break;
            case DemoPacketType.DEM_PACKET:
            case DemoPacketType.DEM_SIGNON_PACKET:
            case DemoPacketType.DEM_FULL_PACKET: {
                const messagePackets = demoPacket.data;

                for (let i = 0; i < messagePackets.length; i++) {
                    const messagePacket = messagePackets[i];

                    await this._interceptPre(InterceptorStage.MESSAGE_PACKET, demoPacket, messagePacket);

                    switch (messagePacket.type) {
                        case MessagePacketType.SVC_SERVER_INFO: {
                            this._demoMessageHandler.handleSvcServerInfo(messagePacket);

                            break;
                        }
                        case MessagePacketType.SVC_CREATE_STRING_TABLE: {
                            this._demoMessageHandler.handleSvcCreateStringTable(messagePacket);

                            break;
                        }
                        case MessagePacketType.SVC_UPDATE_STRING_TABLE: {
                            this._demoMessageHandler.handleSvcUpdateStringTable(messagePacket);

                            break;
                        }
                        case MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES: {
                            this._demoMessageHandler.handleSvcClearAllStringTables(messagePacket);

                            break;
                        }
                        case MessagePacketType.SVC_PACKET_ENTITIES: {
                            const events = this._demoMessageHandler.handleSvcPacketEntities(messagePacket);

                            await this._interceptPre(InterceptorStage.ENTITY_PACKET, demoPacket, messagePacket, events);

                            events.forEach((event) => {
                                const entity = event.entity;

                                switch (event.operation) {
                                    case EntityOperation.CREATE:
                                    case EntityOperation.UPDATE:
                                        if (!entity.active) {
                                            entity.activate();
                                        }

                                        event.mutations.forEach((mutation) => {
                                            entity.updateByFieldPath(mutation.fieldPath, mutation.value);
                                        });

                                        break;
                                    case EntityOperation.DELETE:
                                        this._engine.demo.deleteEntity(entity.index);

                                        break;
                                    case EntityOperation.LEAVE:
                                        entity.deactivate();

                                        break;
                                }
                            });

                            await this._interceptPost(InterceptorStage.ENTITY_PACKET, demoPacket, messagePacket, events);

                            break;
                        }
                        default:
                            break;
                    }

                    this._engine.getPacketTracker().handleMessagePacket(demoPacket, messagePacket);

                    await this._interceptPost(InterceptorStage.MESSAGE_PACKET, demoPacket, messagePacket);
                }

                break;
            }
        }

        this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_ANALYZER);

        this._engine.getPacketTracker().handleDemoPacket(demoPacket);

        await this._interceptPost(InterceptorStage.DEMO_PACKET, demoPacket);

        callback();
    }

    /**
     * @protected
     * @param {InterceptorStage} stage
     * @param {...*} args
     */
    async _interceptPost(stage, ...args) {
        for (let i = 0; i < this._engine.interceptors.post[stage.code].length; i++) {
            const interceptor = this._engine.interceptors.post[stage.code][i];

            await interceptor(...args);
        }
    }

    /**
     * @protected
     * @param {InterceptorStage} stage
     * @param {...*} args
     */
    async _interceptPre(stage, ...args) {
        for (let i = 0; i < this._engine.interceptors.pre[stage.code].length; i++) {
            const interceptor = this._engine.interceptors.pre[stage.code][i];

            await interceptor(...args);
        }
    }
}

export default DemoStreamPacketAnalyzer;

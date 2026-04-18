import Transform from '#core/stream/Transform.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import InterceptorStage from '#data/enums/InterceptorStage.js';
import MessagePacketType from '#data/enums/MessagePacketType.js';
import PerformanceTrackerCategory from '#data/enums/PerformanceTrackerCategory.js';

import DemoEntityHandler from '#handlers/DemoEntityHandler.js';
import DemoMessageHandler from '#handlers/DemoMessageHandler.js';
import DemoPacketHandler from '#handlers/DemoPacketHandler.js';

/**
 * Given a stream of {@link DemoPacket}, processes them sequentially,
 * updating the state of the {@link Demo} accordingly.
 */
class DemoStreamPacketAnalyzer extends Transform {
    /**
     * @public
     * @constructor
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super();

        this._engine = engine;

        this._demoEntityHandler = new DemoEntityHandler(engine.demo);
        this._demoMessageHandler = new DemoMessageHandler(engine.demo);
        this._demoPacketHandler = new DemoPacketHandler(engine.demo);
    }

    /**
     * @async
     * @protected
     * @param {DemoPacket} demoPacket
     */
    async _handle(demoPacket) {
        if (this._engine.paused) {
            await this._engine.pausePromise.promise;
        }

        this._engine.interceptPre(InterceptorStage.DEMO_PACKET, demoPacket);

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
            case DemoPacketType.DEM_STRING_TABLES: {
                this._demoPacketHandler.handleDemStringTables(demoPacket);

                break;
            }
            case DemoPacketType.DEM_PACKET:
            case DemoPacketType.DEM_SIGNON_PACKET:
            case DemoPacketType.DEM_FULL_PACKET: {
                if (demoPacket.type === DemoPacketType.DEM_FULL_PACKET) {
                    this._demoPacketHandler.handleDemFullPacketTables(demoPacket);
                }

                this._handleMessagePackets(demoPacket, demoPacket.data.messagePackets);

                break;
            }
        }

        this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_ANALYZER);

        this._engine.getPacketTracker().handleDemoPacket(demoPacket);

        this._engine.interceptPost(InterceptorStage.DEMO_PACKET, demoPacket);
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {Array<MessagePacket>} messagePackets
     */
    _handleMessagePackets(demoPacket, messagePackets) {
        for (let i = 0; i < messagePackets.length; i++) {
            const messagePacket = messagePackets[i];

            this._engine.interceptPre(InterceptorStage.MESSAGE_PACKET, demoPacket, messagePacket);

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
                    this._demoMessageHandler.handleSvcClearAllStringTables();

                    break;
                }
                case MessagePacketType.SVC_PACKET_ENTITIES: {
                    const events = this._demoMessageHandler.handleSvcPacketEntities(messagePacket);

                    this._engine.interceptPre(InterceptorStage.ENTITY_PACKET, demoPacket, messagePacket, events);

                    this._demoEntityHandler.handleEntityEvents(events);

                    this._engine.interceptPost(InterceptorStage.ENTITY_PACKET, demoPacket, messagePacket, events);

                    break;
                }
                default:
                    break;
            }

            this._engine.getPacketTracker().handleMessagePacket(demoPacket, messagePacket);

            this._engine.interceptPost(InterceptorStage.MESSAGE_PACKET, demoPacket, messagePacket);
        }
    }
}

export default DemoStreamPacketAnalyzer;

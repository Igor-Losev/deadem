import TransformStream from '#core/stream/TransformStream.js';

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
class DemoStreamPacketAnalyzer extends TransformStream {
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
     * @protected
     * @param {DemoPacket} demoPacket
     */
    async _handle(demoPacket) {
        await this._engine.interceptPre(InterceptorStage.DEMO_PACKET, demoPacket);

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
            case DemoPacketType.DEM_SIGNON_PACKET: {
                await handleMessagePackets.call(this, demoPacket, demoPacket.data);

                break;
            }
            case DemoPacketType.DEM_FULL_PACKET: {
                this._demoPacketHandler.handleDemFullPacketTables(demoPacket);

                await handleMessagePackets.call(this, demoPacket, demoPacket.data.messagePackets);

                break;
            }
        }

        this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_ANALYZER);

        this._engine.getPacketTracker().handleDemoPacket(demoPacket);

        await this._engine.interceptPost(InterceptorStage.DEMO_PACKET, demoPacket);
    }
}

/**
 * @param {DemoPacket} demoPacket
 * @param {Array<MessagePacket>} messagePackets
 * @returns {Promise<void>}
 */
async function handleMessagePackets(demoPacket, messagePackets) {
    for (let i = 0; i < messagePackets.length; i++) {
        const messagePacket = messagePackets[i];

        await this._engine.interceptPre(InterceptorStage.MESSAGE_PACKET, demoPacket, messagePacket);

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

                await this._engine.interceptPre(InterceptorStage.ENTITY_PACKET, demoPacket, messagePacket, events);

                this._demoEntityHandler.handleEntityEvents(events);

                await this._engine.interceptPost(InterceptorStage.ENTITY_PACKET, demoPacket, messagePacket, events);

                break;
            }
            default:
                break;
        }

        this._engine.getPacketTracker().handleMessagePacket(demoPacket, messagePacket);

        await this._engine.interceptPost(InterceptorStage.MESSAGE_PACKET, demoPacket, messagePacket);
    }
}

export default DemoStreamPacketAnalyzer;

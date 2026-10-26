/** @import DemoPacket from '../data/DemoPacket.js' */
/** @import MessagePacket from '../data/MessagePacket.js' */
/** @import StringTableMutationEvent from '../data/tables/string/StringTableMutationEvent.js' */

import Assert from '../core/Assert.js';

import DemoPacketType from '../data/enums/DemoPacketType.js';
import InterceptorStage from '../data/enums/InterceptorStage.js';
import MessagePacketType from '../data/enums/MessagePacketType.js';
import PerformanceTrackerCategory from '../data/enums/PerformanceTrackerCategory.js';

import DemoEntityHandler from '../handlers/DemoEntityHandler.js';
import DemoMessageHandler from '../handlers/DemoMessageHandler.js';
import DemoPacketHandler from '../handlers/DemoPacketHandler.js';

import PacketTracker from '../trackers/PacketTracker.js';
import PerformanceTracker from '../trackers/PerformanceTracker.js';

import InterceptorRegistry from '../InterceptorRegistry.js';

/**
 * Applies a {@link DemoPacket} to the {@link Demo} state: routes the packet
 * and its messages to the corresponding handlers, firing interceptors
 * around every step and updating trackers.
 */
class DemoPacketApplier {
    /**
     * @public
     * @constructor
     * @param {DemoPacketHandler} demoPacketHandler
     * @param {DemoMessageHandler} demoMessageHandler
     * @param {DemoEntityHandler} demoEntityHandler
     * @param {InterceptorRegistry} interceptors
     * @param {PacketTracker} packetTracker
     * @param {PerformanceTracker} performanceTracker
     */
    constructor(demoPacketHandler, demoMessageHandler, demoEntityHandler, interceptors, packetTracker, performanceTracker) {
        Assert.isTrue(demoPacketHandler instanceof DemoPacketHandler, 'Invalid demoPacketHandler: expected an instance of DemoPacketHandler');
        Assert.isTrue(demoMessageHandler instanceof DemoMessageHandler, 'Invalid demoMessageHandler: expected an instance of DemoMessageHandler');
        Assert.isTrue(demoEntityHandler instanceof DemoEntityHandler, 'Invalid demoEntityHandler: expected an instance of DemoEntityHandler');
        Assert.isTrue(interceptors instanceof InterceptorRegistry, 'Invalid interceptors: expected an instance of InterceptorRegistry');
        Assert.isTrue(packetTracker instanceof PacketTracker, 'Invalid packetTracker: expected an instance of PacketTracker');
        Assert.isTrue(performanceTracker instanceof PerformanceTracker, 'Invalid performanceTracker: expected an instance of PerformanceTracker');

        /** @private */
        this._demoPacketHandler = demoPacketHandler;
        /** @private */
        this._demoMessageHandler = demoMessageHandler;
        /** @private */
        this._demoEntityHandler = demoEntityHandler;

        /** @private */
        this._interceptors = interceptors;

        /** @private */
        this._packetTracker = packetTracker;
        /** @private */
        this._performanceTracker = performanceTracker;
    }

    /**
     * @public
     * @param {DemoPacket} demoPacket
     * @param {Array<StringTableMutationEvent>|null} [snapshotEvents=null] - String table snapshots of a seek. Applied before the messages.
     */
    apply(demoPacket, snapshotEvents = null) {
        this._interceptors.firePre(InterceptorStage.DEMO_PACKET, demoPacket);

        this._performanceTracker.start(PerformanceTrackerCategory.DEMO_PACKET_APPLIER);

        if (snapshotEvents !== null) {
            this._handleStringTableEvents(demoPacket, null, snapshotEvents);
        }

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
                this._handleStringTableEvents(demoPacket, null, this._demoPacketHandler.handleDemStringTables(demoPacket));

                break;
            }
            case DemoPacketType.DEM_PACKET:
            case DemoPacketType.DEM_SIGNON_PACKET:
            case DemoPacketType.DEM_FULL_PACKET: {
                this._handleMessagePackets(demoPacket, /** @type {{ messagePackets: Array<MessagePacket> }} */ (demoPacket.data).messagePackets);

                break;
            }
        }

        this._performanceTracker.end(PerformanceTrackerCategory.DEMO_PACKET_APPLIER);

        this._packetTracker.handleDemoPacket(demoPacket);

        this._interceptors.firePost(InterceptorStage.DEMO_PACKET, demoPacket);
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {Array<MessagePacket>} messagePackets
     */
    _handleMessagePackets(demoPacket, messagePackets) {
        for (let i = 0; i < messagePackets.length; i++) {
            const messagePacket = messagePackets[i];

            this._interceptors.firePre(InterceptorStage.MESSAGE_PACKET, demoPacket, messagePacket);

            switch (messagePacket.type) {
                case MessagePacketType.SVC_SERVER_INFO: {
                    this._demoMessageHandler.handleSvcServerInfo(messagePacket);

                    break;
                }
                case MessagePacketType.SVC_CREATE_STRING_TABLE: {
                    this._handleStringTableEvents(demoPacket, messagePacket, this._demoMessageHandler.handleSvcCreateStringTable(messagePacket));

                    break;
                }
                case MessagePacketType.SVC_UPDATE_STRING_TABLE: {
                    this._handleStringTableEvents(demoPacket, messagePacket, this._demoMessageHandler.handleSvcUpdateStringTable(messagePacket));

                    break;
                }
                case MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES: {
                    this._handleStringTableEvents(demoPacket, messagePacket, this._demoMessageHandler.handleSvcClearAllStringTables());

                    break;
                }
                case MessagePacketType.SVC_USER_COMMANDS:
                case MessagePacketType.SVC_USER_COMMAND_KEYFRAME: {
                    const listening = this._interceptors.getIsRegistered(InterceptorStage.USER_COMMAND);

                    const events = this._demoMessageHandler.handleSvcUserCommands(messagePacket, demoPacket.getIsSnapshot(), listening);

                    if (events.length > 0) {
                        this._interceptors.firePost(InterceptorStage.USER_COMMAND, demoPacket, messagePacket, events);
                    }

                    break;
                }
                case MessagePacketType.SVC_PACKET_ENTITIES: {
                    const direct = !this._interceptors.getIsRegistered(InterceptorStage.ENTITY_PACKET);

                    const events = this._demoMessageHandler.handleSvcPacketEntities(messagePacket, demoPacket.getIsSnapshot(), direct);

                    if (events !== null) {
                        this._interceptors.firePre(InterceptorStage.ENTITY_PACKET, demoPacket, messagePacket, events);

                        this._demoEntityHandler.handleEntityEvents(events);

                        this._interceptors.firePost(InterceptorStage.ENTITY_PACKET, demoPacket, messagePacket, events);
                    }

                    break;
                }
                default:
                    break;
            }

            this._packetTracker.handleMessagePacket(demoPacket, messagePacket);

            this._interceptors.firePost(InterceptorStage.MESSAGE_PACKET, demoPacket, messagePacket);
        }
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {MessagePacket|null} messagePacket - `null` for a `DEM_STRING_TABLES` packet and for seek snapshots.
     * @param {Array<StringTableMutationEvent>} events
     */
    _handleStringTableEvents(demoPacket, messagePacket, events) {
        this._interceptors.firePre(InterceptorStage.STRING_TABLE, demoPacket, messagePacket, events);

        this._demoMessageHandler.handleStringTableEvents(events);

        this._interceptors.firePost(InterceptorStage.STRING_TABLE, demoPacket, messagePacket, events);
    }
}

export default DemoPacketApplier;

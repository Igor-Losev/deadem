'use strict';

const Stream = require('stream');

const DemoCommandType = require('./../data/enums/DemoCommandType'),
    MessagePacketType = require('./../data/enums/MessagePacketType'),
    PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

const DemoPacketHandler = require('./../handlers/DemoPacketHandler'),
    DemoMessageHandler = require('./../handlers/DemoMessageHandler');

const WorkerRequestDPacketSync = require('./../workers/requests/WorkerRequestDPacketSync'),
    WorkerRequestMPacketSync = require('./../workers/requests/WorkerRequestMPacketSync'),
    WorkerRequestSvcPacketEntities = require('./../workers/requests/WorkerRequestSvcPacketEntities');

/**
 * Given a stream of {@link DemoPacket}, processes them sequentially,
 * updating the state of the {@link Parser} accordingly.
 */
class DemoStreamPacketAnalyzer extends Stream.Transform {
    /**
     * @public
     * @constructor
     * @param {Parser} parser
     */
    constructor(parser) {
        super({ objectMode: true });

        this._parser = parser;

        this._demoPacketHandler = new DemoPacketHandler(parser.demo);
        this._demoMessageHandler = new DemoMessageHandler(parser.demo);
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    async _transform(demoPacket, encoding, callback) {
        this._parser.performanceTracker.start(PerformanceTrackerCategory.DEMO_PACKET_ANALYZER);
        this._parser.packetTracker.handleDemoPacket(demoPacket);

        switch (demoPacket.command) {
            case DemoCommandType.DEM_ERROR:
                break;
            case DemoCommandType.DEM_STOP:
                break;
            case DemoCommandType.DEM_FILE_HEADER:
                break;
            case DemoCommandType.DEM_FILE_INFO:
                break;
            case DemoCommandType.DEM_SYNC_TICK:
                break;
            case DemoCommandType.DEM_SEND_TABLES: {
                this._demoPacketHandler.handleDemSendTables(demoPacket);

                if (this._parser.isMultiThreaded) {
                    const request = new WorkerRequestDPacketSync(demoPacket);

                    await this._parser.workerManager.broadcast(request);
                }

                break;
            }
            case DemoCommandType.DEM_CLASS_INFO: {
                this._demoPacketHandler.handleDemClassInfo(demoPacket);

                if (this._parser.isMultiThreaded) {
                    const request = new WorkerRequestDPacketSync(demoPacket);

                    await this._parser.workerManager.broadcast(request);
                }

                break;
            }
            case DemoCommandType.DEM_STRING_TABLES:
                this._demoPacketHandler.handleDemStringTables(demoPacket);

                if (this._parser.isMultiThreaded) {
                    const request = new WorkerRequestDPacketSync(demoPacket);

                    await this._parser.workerManager.broadcast(request);
                }

                break;
            case DemoCommandType.DEM_CONSOLE_CMD:
                break;
            case DemoCommandType.DEM_CUSTOM_DATA:
                break;
            case DemoCommandType.DEM_CUSTOM_DATA_CALLBACKS:
                break;
            case DemoCommandType.DEM_USER_CMD:
                break;
            case DemoCommandType.DEM_SAVE_GAME:
                break;
            case DemoCommandType.DEM_SPAWN_GROUPS:
                break;
            case DemoCommandType.DEM_ANIMATION_DATA:
                break;
            case DemoCommandType.DEM_ANIMATION_HEADER:
                break;
            case DemoCommandType.DEM_RECOVERY:
                break;

            case DemoCommandType.DEM_PACKET:
            case DemoCommandType.DEM_SIGNON_PACKET:
            case DemoCommandType.DEM_FULL_PACKET: {
                const messagePackets = demoPacket.data;

                for (let i = 0; i < messagePackets.length; i++) {
                    const messagePacket = messagePackets[i];

                    this._parser.packetTracker.handleMessagePacket(demoPacket, messagePacket);

                    switch (messagePacket.type) {
                        case MessagePacketType.NET_TICK:
                            break;
                        case MessagePacketType.NET_SET_CON_VAR:
                        case MessagePacketType.NET_SIGNON_STATE:
                        case MessagePacketType.NET_SPAWN_GROUP_LOAD:
                        case MessagePacketType.NET_SPAWN_GROUP_SET_CREATION_TICK:
                            break;

                        case MessagePacketType.SVC_SERVER_INFO: {
                            this._demoMessageHandler.handleSvcServerInfo(messagePacket);

                            if (this._parser.isMultiThreaded) {
                                const request = new WorkerRequestMPacketSync(messagePacket);

                                await this._parser.workerManager.broadcast(request);
                            }

                            break;
                        }
                        case MessagePacketType.SVC_CLASS_INFO:
                            break;
                        case MessagePacketType.SVC_CREATE_STRING_TABLE: {
                            this._demoMessageHandler.handleSvcCreateStringTable(messagePacket);

                            if (this._parser.isMultiThreaded) {
                                const request = new WorkerRequestMPacketSync(messagePacket);

                                await this._parser.workerManager.broadcast(request);
                            }

                            break;
                        }
                        case MessagePacketType.SVC_UPDATE_STRING_TABLE: {
                            this._demoMessageHandler.handleSvcUpdateStringTable(messagePacket);

                            if (this._parser.isMultiThreaded) {
                                const request = new WorkerRequestMPacketSync(messagePacket);

                                await this._parser.workerManager.broadcast(request);
                            }

                            break;
                        }
                        case MessagePacketType.SVC_VOICE_INIT:
                            break;
                        case MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES: {
                            this._demoMessageHandler.handleSvcClearAllStringTables(messagePacket);

                            if (this._parser.isMultiThreaded) {
                                const request = new WorkerRequestMPacketSync(messagePacket);

                                await this._parser.workerManager.broadcast(request);
                            }

                            break;
                        }
                        case MessagePacketType.SVC_PACKET_ENTITIES: {
                            if (this._parser.isMultiThreaded) {
                                const thread = await this._parser.workerManager.allocate();

                                const request = new WorkerRequestSvcPacketEntities(messagePacket);

                                thread.send(request)
                                    .then((response) => {
                                        this._parser.workerManager.free(thread);
                                    });
                            } else {
                                this._demoMessageHandler.handleSvcPacketEntities(messagePacket);
                            }

                            break;
                        }
                        case MessagePacketType.SVC_HLTV_STATUS:
                            break;
                        case MessagePacketType.SVC_USER_COMMANDS:
                            break;

                        case MessagePacketType.USER_MESSAGE_PARTICLE_MANAGER:
                        case MessagePacketType.USER_MESSAGE_PLAY_RESPONSE_CONDITIONAL:
                            break;

                        case MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT_LIST:
                        case MessagePacketType.GE_SOURCE1_LEGACY_GAME_EVENT:
                        case MessagePacketType.GE_SOS_START_SOUND_EVENT:
                        case MessagePacketType.GE_SOS_STOP_SOUND_EVENT:
                        case MessagePacketType.GE_SOS_SET_SOUND_EVENT_PARAMS:
                            break;

                        case MessagePacketType.CITADEL_USER_MESSAGE_DAMAGE:
                            break;
                        default:
                            break;
                    }
                }

                break;
            }
        }

        this._parser.performanceTracker.end(PerformanceTrackerCategory.DEMO_PACKET_ANALYZER);

        callback();
    }
}

module.exports = DemoStreamPacketAnalyzer;

'use strict';

const Stream = require('stream');

const DemoCommandType = require('./../data/enums/DemoCommandType'),
    InterceptorStage = require('./../data/enums/InterceptorStage'),
    MessagePacketType = require('./../data/enums/MessagePacketType'),
    PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

const DemoPacketHandler = require('./../handlers/DemoPacketHandler'),
    DemoMessageHandler = require('./../handlers/DemoMessageHandler');

const WorkerRequestDPacketSync = require('./../workers/requests/WorkerRequestDPacketSync'),
    WorkerRequestMPacketSync = require('./../workers/requests/WorkerRequestMPacketSync'),
    WorkerRequestSvcPacketEntities = require('./../workers/requests/WorkerRequestSvcPacketEntities');

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

        this._multiThreaded = this._engine.getIsMultiThreaded();
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    async _transform(demoPacket, encoding, callback) {
        this._engine.getPacketTracker().handleDemoPacket(demoPacket);

        await this._interceptPre(InterceptorStage.DEMO_PACKET, demoPacket);

        this._engine.getPerformanceTracker().start(PerformanceTrackerCategory.DEMO_PACKET_ANALYZER);

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

                if (this._multiThreaded) {
                    const request = new WorkerRequestDPacketSync(demoPacket);

                    await this._engine.workerManager.broadcast(request);
                }

                break;
            }
            case DemoCommandType.DEM_CLASS_INFO: {
                this._demoPacketHandler.handleDemClassInfo(demoPacket);

                if (this._multiThreaded) {
                    const request = new WorkerRequestDPacketSync(demoPacket);

                    await this._engine.workerManager.broadcast(request);
                }

                break;
            }
            case DemoCommandType.DEM_STRING_TABLES:
                this._demoPacketHandler.handleDemStringTables(demoPacket);

                if (this._multiThreaded) {
                    const request = new WorkerRequestDPacketSync(demoPacket);

                    await this._engine.workerManager.broadcast(request);
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

                    this._engine.getPacketTracker().handleMessagePacket(demoPacket, messagePacket);

                    await this._interceptPre(InterceptorStage.MESSAGE_PACKET, demoPacket, messagePacket);

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

                            if (this._multiThreaded) {
                                const request = new WorkerRequestMPacketSync(messagePacket);

                                await this._engine.workerManager.broadcast(request);
                            }

                            break;
                        }
                        case MessagePacketType.SVC_CLASS_INFO:
                            break;
                        case MessagePacketType.SVC_CREATE_STRING_TABLE: {
                            this._demoMessageHandler.handleSvcCreateStringTable(messagePacket);

                            if (this._multiThreaded) {
                                const request = new WorkerRequestMPacketSync(messagePacket);

                                await this._engine.workerManager.broadcast(request);
                            }

                            break;
                        }
                        case MessagePacketType.SVC_UPDATE_STRING_TABLE: {
                            this._demoMessageHandler.handleSvcUpdateStringTable(messagePacket);

                            if (this._multiThreaded) {
                                const request = new WorkerRequestMPacketSync(messagePacket);

                                await this._engine.workerManager.broadcast(request);
                            }

                            break;
                        }
                        case MessagePacketType.SVC_VOICE_INIT:
                            break;
                        case MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES: {
                            this._demoMessageHandler.handleSvcClearAllStringTables(messagePacket);

                            if (this._multiThreaded) {
                                const request = new WorkerRequestMPacketSync(messagePacket);

                                await this._engine.workerManager.broadcast(request);
                            }

                            break;
                        }
                        case MessagePacketType.SVC_PACKET_ENTITIES: {
                            if (this._multiThreaded) {
                                const thread = await this._engine.workerManager.allocate();

                                const request = new WorkerRequestSvcPacketEntities(messagePacket);

                                thread.send(request)
                                    .then((response) => {
                                        this._engine.workerManager.free(thread);
                                    });
                            } else {
                                const events = this._demoMessageHandler.handleSvcPacketEntities(messagePacket);

                                await this._interceptPre(InterceptorStage.ENTITY_PACKET, demoPacket, messagePacket, events);

                                events.forEach((event) => {
                                    const entity = event.entity;

                                    event.mutations.forEach((mutation) => {
                                        entity.updateByFieldPath(mutation.fieldPath, mutation.value);
                                    });
                                });

                                await this._interceptPost(InterceptorStage.ENTITY_PACKET, demoPacket, messagePacket, events);
                            }

                            break;
                        }
                        case MessagePacketType.SVC_HLTV_STATUS:
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
                        case MessagePacketType.GE_SOS_STOP_SOUND_EVENT_HASH:
                            break;

                        case MessagePacketType.CITADEL_USER_MESSAGE_DAMAGE:
                        case MessagePacketType.CITADEL_USER_MESSAGE_MAP_PING:
                        case MessagePacketType.CITADEL_USER_MESSAGE_TEAM_REWARDS:
                        case MessagePacketType.CITADEL_USER_MESSAGE_TRIGGER_DAMAGE_FLASH:
                        case MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_CHANGED:
                        case MessagePacketType.CITADEL_USER_MESSAGE_RECENT_DAMAGE_SUMMARY:
                        case MessagePacketType.CITADEL_USER_MESSAGE_SPECTATOR_TEAM_CHANGED:
                        case MessagePacketType.CITADEL_USER_MESSAGE_CHAT_WHEEL:
                        case MessagePacketType.CITADEL_USER_MESSAGE_GOLD_HISTORY:
                        case MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE:
                        case MessagePacketType.CITADEL_USER_MESSAGE_QUICK_RESPONSE:
                        case MessagePacketType.CITADEL_USER_MESSAGE_POST_MATCH_DETAILS:
                        case MessagePacketType.CITADEL_USER_MESSAGE_CHAT_EVENT:
                        case MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_INTERRUPTED:
                        case MessagePacketType.CITADEL_USER_MESSAGE_HERO_KILLED:
                        case MessagePacketType.CITADEL_USER_MESSAGE_RETURN_IDOL:
                        case MessagePacketType.CITADEL_USER_MESSAGE_SET_CLIENT_CAMERA_ANGLES:
                        case MessagePacketType.CITADEL_USER_MESSAGE_MAP_LINE:
                        case MessagePacketType.CITADEL_USER_MESSAGE_BULLET_HIT:
                        case MessagePacketType.CITADEL_USER_MESSAGE_OBJECTIVE_MASK:
                        case MessagePacketType.CITADEL_USER_MESSAGE_MODIFIER_APPLIED:
                        case MessagePacketType.CITADEL_USER_MESSAGE_CAMERA_CONTROLLER:
                        case MessagePacketType.CITADEL_USER_MESSAGE_AURA_MODIFIER_APPLIED:
                        case MessagePacketType.CITADEL_USER_MESSAGE_OBSTRUCTED_SHOT_FIRED:
                        case MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_LATE_FAILURE:
                        case MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_PING:
                        case MessagePacketType.CITADEL_USER_MESSAGE_POST_PROCESSING_ANIM:
                        case MessagePacketType.CITADEL_USER_MESSAGE_DEATH_REPLAY_DATA:
                        case MessagePacketType.CITADEL_USER_MESSAGE_PLAYER_LIFETIME_STAT_INFO:
                        case MessagePacketType.CITADEL_USER_MESSAGE_FORCE_SHOP_CLOSED:
                        case MessagePacketType.CITADEL_USER_MESSAGE_STAMINA_DRAINED:
                        case MessagePacketType.CITADEL_USER_MESSAGE_ABILITY_NOTIFY:
                        case MessagePacketType.CITADEL_USER_MESSAGE_GET_DAMAGE_STATS_RESPONSE:
                            break;

                        case MessagePacketType.GE_FIRE_BULLETS:
                        case MessagePacketType.GE_PLAYER_ANIM_EVENT:
                        case MessagePacketType.GE_PARTICLE_SYSTEM_MANAGER:
                        case MessagePacketType.GE_SCREEN_TEXT_PRETTY:
                        case MessagePacketType.GE_SERVER_REQUESTED_TRACER:
                        case MessagePacketType.GE_BULLET_IMPACT:
                        case MessagePacketType.GE_ENABLE_SAT_VOLUMES_EVENT:
                        case MessagePacketType.GE_PLACE_SAT_VOLUME_EVENT:
                        case MessagePacketType.GE_DISABLE_SAT_VOLUME_EVENT:
                        case MessagePacketType.GE_REMOVE_SAT_VOLUME_EVENT:
                            break;

                        case MessagePacketType.CITADEL_ENTITY_MESSAGE_BREAKABLE_PROP_SPAWN_DEBRIS:
                            break;

                        default:
                            break;
                    }

                    await this._interceptPost(InterceptorStage.MESSAGE_PACKET, demoPacket, messagePacket);
                }

                break;
            }
        }

        this._engine.getPerformanceTracker().end(PerformanceTrackerCategory.DEMO_PACKET_ANALYZER);

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

module.exports = DemoStreamPacketAnalyzer;

'use strict';

const assert = require('assert/strict'),
    Stream = require('stream');

const ProtoProvider = require('./../providers/ProtoProvider.instance');

const DemoCommandType = require('./../data/enums/DemoCommandType'),
    MessagePacketType = require('./../data/enums/MessagePacketType');

const StringTable = require('../data/tables/string/StringTable'),
    StringTableContainer = require('../data/tables/string/StringTableContainer');

const CitadelUserMessageIds = ProtoProvider.CITADEL_USER_MESSAGES.getEnum('CitadelUserMessageIds'),
    NET_Messages = ProtoProvider.NETWORK_BASE_TYPES.getEnum('NET_Messages'),
    SVC_Messages = ProtoProvider.NET_MESSAGES.getEnum('SVC_Messages');

class DemoStreamPacketAnalyzer extends Stream.Transform {
    constructor() {
        super({ objectMode: true });

        this._server = { };
        this._server.classIdBitSize = null;
        this._server.maxClasses = null;
        this._server.maxClients = null;

        this._stringTableContainer = new StringTableContainer();
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    _transform(demoPacket, encoding, callback) {
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
            case DemoCommandType.DEM_SEND_TABLES:
                this._handleDemSendTables(demoPacket.data);

                break;
            case DemoCommandType.DEM_CLASS_INFO:
                this._handleDemClassInfo(demoPacket.data);

                break;
            case DemoCommandType.DEM_STRING_TABLES:

                break;
            case DemoCommandType.DEM_PACKET:
                this._handleDemPacket(demoPacket.data);

                break;
            case DemoCommandType.DEM_SIGNON_PACKET:
                this._handleDemPacket(demoPacket.data);

                break;
            case DemoCommandType.DEM_CONSOLE_CMD:
                break;
            case DemoCommandType.DEM_CUSTOM_DATA:
                break;
            case DemoCommandType.DEM_CUSTOM_DATA_CALLBACKS:
                break;
            case DemoCommandType.DEM_USER_CMD:
                break;
            case DemoCommandType.DEM_FULL_PACKET:
                this._handleDemPacket(demoPacket.data);

                break;
            case DemoCommandType.DEM_SAVE_GAME:
                break;
            case DemoCommandType.DEM_SPAWN_GROUPS:
                break;
            case DemoCommandType.DEM_ANIMATION_DATA:
                break;
            case DemoCommandType.DEM_ANIMATION_HEADER:
                break;
        }

        callback();
    }

    /**
     * @protected
     * @param {Array<{}>} classes
     */
    _handleDemClassInfo(classes) {

    }

    /**
     * @protected
     * @param {Array<MessagePacket>} messagePackets
     */
    _handleDemPacket(messagePackets) {
        messagePackets.forEach((messagePacket) => {
            switch (messagePacket.type) {
                case MessagePacketType.NET_TICK:
                    break;
                case MessagePacketType.SVC_SERVER_INFO:
                    this._handleMessageServerInfo(messagePacket.data);

                    break;
                case MessagePacketType.SVC_CLASS_INFO:
                    this._handleMessageClassInfo(messagePacket.data);

                    break;
                case MessagePacketType.SVC_CREATE_STRING_TABLE:
                    this._stringTableContainer.handleCreate(messagePacket.data);

                    break;
                case MessagePacketType.SVC_UPDATE_STRING_TABLE:
                    this._stringTableContainer.handleUpdate(messagePacket.data);

                    break;
                case MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES:
                    this._stringTableContainer.handleClear();

                    break;
                case MessagePacketType.SVC_PACKET_ENTITIES:
                    break;
                case MessagePacketType.CITADEL_USER_MESSAGE_DAMAGE:
                    break;
                default:
                    break;
            }
        });
    }

    _handleDemSendTables(data) {

    }

    _handleMessageClassInfo(message) {

    }

    _handleMessageServerInfo(message) {
        assert(Number.isInteger(message.maxClasses));
        assert(Number.isInteger(message.maxClients));

        this._server.maxClasses = message.maxClasses;
        this._server.maxClients = message.maxClients;

        this._server.classIdBitSize = Math.log2(message.maxClasses) + 1;
    }
}

module.exports = DemoStreamPacketAnalyzer;

'use strict';

const assert = require('assert/strict'),
    Stream = require('stream');

const ProtoProvider = require('./../providers/ProtoProvider.instance');

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
     * @private
     * @param {DemoPacket} demoPacket
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     */
    _transform(demoPacket, encoding, callback) {

        if (!Array.isArray(demoPacket.data)) {
            callback();

            return;
        }

        demoPacket.data.forEach((messagePacket) => {
            if (messagePacket === null) {
                return;
            }

            switch (messagePacket.type) {
                /** 004 */ case NET_Messages.net_Tick:
                    break;
                /** 040 */ case SVC_Messages.svc_ServerInfo:
                    this._handleMessageServerInfo(messagePacket.data);

                    break;
                /** 042 */ case SVC_Messages.svc_ClassInfo:
                    this._handleMessageClassInfo(messagePacket.data);

                    break;
                /** 044 */ case SVC_Messages.svc_CreateStringTable:
                    this._stringTableContainer.handleCreate(messagePacket.data);

                    break;
                /** 045 */ case SVC_Messages.svc_UpdateStringTable:
                    this._stringTableContainer.handleUpdate(messagePacket.data);

                    break;
                /** 051 */ case SVC_Messages.svc_ClearAllStringTables:
                    this._stringTableContainer.handleClear();

                    break;
                /** 055 */ case SVC_Messages.svc_PacketEntities:
                    // console.log(messagePacket.data);

                    // throw new Error(123);

                    break;
                /** 300 */ case CitadelUserMessageIds.k_EUserMsg_Damage:
                    break;
                default:
                    break;
            }
        });

        callback();
    }

    _handleMessageClassInfo(message) {
        console.log(message);
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

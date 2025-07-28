import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';

import Demo from '#data/Demo.js';
import DemoPacket from '#data/DemoPacket.js';
import Entity from '#data/entity/Entity.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import MessagePacketType from '#data/enums/MessagePacketType.js';
import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import MessagePacketRawExtractor from '#extractors/MessagePacketRawExtractor.js';

import DemoMessageHandler from '#handlers/DemoMessageHandler.js';
import DemoPacketHandler from '#handlers/DemoPacketHandler.js';

import WorkerRequestDPacketSync from '#workers/requests/WorkerRequestDPacketSync.js';
import WorkerRequestMPacketSync from '#workers/requests/WorkerRequestMPacketSync.js';

import WorkerResponseDHPParse from '#workers/responses/WorkerResponseDHPParse.js';
import WorkerResponseDPacketRawBatchSync from '#workers/responses/WorkerResponseDPacketRawBatchSync.js';
import WorkerResponseDPacketSync from '#workers/responses/WorkerResponseDPacketSync.js';
import WorkerResponseMPacketSync from '#workers/responses/WorkerResponseMPacketSync.js';
import WorkerResponseSvcCreatedEntities from '#workers/responses/WorkerResponseSvcCreatedEntities.js';
import WorkerResponseSvcUpdatedEntities from '#workers/responses/WorkerResponseSvcUpdatedEntities.js';

import WorkerMessageBridge from '#workers/WorkerMessageBridge.instance.js';

class Worker {
    /**
     * @abstract
     * @constructor
     */
    constructor() {
        this._demo = new Demo();

        this._demoMessageHandler = new DemoMessageHandler(this._demo);
        this._demoPacketHandler = new DemoPacketHandler(this._demo);
    }

    /**
     * @protected
     */
    _respond() {
        throw new Error('Worker._respond() is not implemented');
    }

    /**
     * @protected
     * @param {*} requestRaw
     */
    _route(requestRaw) {
        const workerRequestClass = WorkerMessageBridge.resolveRequestClass(requestRaw);

        const request = workerRequestClass.deserialize(requestRaw.payload);

        switch (request.type) {
            case WorkerMessageType.DEMO_PACKET_RAW_BATCH_SYNC: {
                this._handleDemoPacketRawBatch(request);

                break;
            }
            default:
                throw new Error(`Unhandled request [ ${request.type.code} ]`);
        }
    }

    /**
     * @protected
     * @param {WorkerRequestDPacketRawBatchSync} request
     */
    _handleDemoPacketRawBatch(request) {
        let events = [ ];

        [ ...request.payload.snapshots, ...request.payload.batch.packets ].forEach((demoPacketRaw) => {
            const demoPacket = DemoPacket.parse(demoPacketRaw);

            if (demoPacket === null) {
                return;
            }

            switch (demoPacket.type) {
                case DemoPacketType.DEM_CLASS_INFO:
                    this._demoPacketHandler.handleDemClassInfo(demoPacket);

                    break;
                case DemoPacketType.DEM_SEND_TABLES:
                    this._demoPacketHandler.handleDemSendTables(demoPacket);

                    break;
                case DemoPacketType.DEM_STRING_TABLES:
                    this._demoPacketHandler.handleDemStringTables(demoPacket);

                    break;
                case DemoPacketType.DEM_PACKET:
                case DemoPacketType.DEM_SIGNON_PACKET:
                case DemoPacketType.DEM_FULL_PACKET: {
                    let messagePackets;

                    if (demoPacket.type === DemoPacketType.DEM_FULL_PACKET) {
                        this._demo.stringTableContainer.handleInstantiate(demoPacket.data.stringTables);

                        messagePackets = demoPacket.data.messagePackets;
                    } else {
                        messagePackets = demoPacket.data;
                    }

                    messagePackets.forEach((messagePacket) => {
                        switch (messagePacket.type) {
                            case MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES:
                                this._demoMessageHandler.handleSvcClearAllStringTables(messagePacket);

                                break;
                            case MessagePacketType.SVC_CREATE_STRING_TABLE:
                                this._demoMessageHandler.handleSvcCreateStringTable(messagePacket);

                                break;
                            case MessagePacketType.SVC_UPDATE_STRING_TABLE:
                                this._demoMessageHandler.handleSvcUpdateStringTable(messagePacket);

                                break;
                            case MessagePacketType.SVC_SERVER_INFO:
                                this._demoMessageHandler.handleSvcServerInfo(messagePacket);

                                break;
                            case MessagePacketType.SVC_PACKET_ENTITIES:
                                events = this._demoMessageHandler.handleSvcPacketEntities(messagePacket);

                                break;
                        }
                    });

                    break;
                }
            }
        });

        const response = new WorkerResponseDPacketRawBatchSync(
            events.map((event) => {
                return [
                    event.operation.id,
                    event.entity.index,
                    event.entity.serial,
                    event.entity.class.id,
                    event.mutations.map(m => [ m.fieldPath.code, m.value ])
                ];
            })
        );

        this._respond(response);
    }
}

export default Worker;

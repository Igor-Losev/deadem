'use strict';

const Stream = require('stream');

const PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory'),
    WorkerTaskType = require('./../data/enums/WorkerTaskType');

const SnappyDecompressor = require('./../decompressors/SnappyDecompressor.instance');

const DemoPacket = require('./../data/DemoPacket'),
    MessagePacketParser = require('./../data/MessagePacketParser');

const LoggerProvider = require('./../providers/LoggerProvider.instance'),
    ProtoProvider = require('./../providers/ProtoProvider.instance');

const PacketTracker = require('./../trackers/PacketTracker.instance'),
    PerformanceTracker = require('./../trackers/PerformanceTracker.instance');

const WorkerManager = require('./../workers/WorkerManager'),
    WorkerTask = require('./../workers/WorkerTask');

const logger = LoggerProvider.getLogger('DemoStreamPacketParser');

const CDemoAnimationData = ProtoProvider.DEMO.lookupType('CDemoAnimationData');
const CDemoAnimationHeader = ProtoProvider.DEMO.lookupType('CDemoAnimationHeader');
const CDemoClassInfo = ProtoProvider.DEMO.lookupType('CDemoClassInfo');
const CDemoConsoleCmd = ProtoProvider.DEMO.lookupType('CDemoConsoleCmd');
const CDemoCustomData = ProtoProvider.DEMO.lookupType('CDemoCustomData');
const CDemoCustomDataCallbacks = ProtoProvider.DEMO.lookupType('CDemoCustomDataCallbacks');
const CDemoFileHeader = ProtoProvider.DEMO.lookupType('CDemoFileHeader');
const CDemoFileInfo = ProtoProvider.DEMO.lookupType('CDemoFileInfo');
const CDemoSaveGame = ProtoProvider.DEMO.lookupType('CDemoSaveGame');
const CDemoSendTables = ProtoProvider.DEMO.lookupType('CDemoSendTables');
const CDemoSpawnGroups = ProtoProvider.DEMO.lookupType('CDemoSpawnGroups');
const CDemoStop = ProtoProvider.DEMO.lookupType('CDemoStop');
const CDemoStringTables = ProtoProvider.DEMO.lookupType('CDemoStringTables');
const CDemoSyncTick = ProtoProvider.DEMO.lookupType('CDemoSyncTick');
const CDemoUserCmd = ProtoProvider.DEMO.lookupType('CDemoUserCmd');

const EDemoCommands = ProtoProvider.DEMO.getEnum('EDemoCommands');

const parsers = new Map();

/*  -1 */ parsers.set(EDemoCommands.DEM_Error, p => null);
/* 000 */ parsers.set(EDemoCommands.DEM_Stop, p => CDemoStop.decode(p));
/* 001 */ parsers.set(EDemoCommands.DEM_FileHeader, p => CDemoFileHeader.decode(p));
/* 002 */ parsers.set(EDemoCommands.DEM_FileInfo, p => CDemoFileInfo.decode(p));
/* 003 */ parsers.set(EDemoCommands.DEM_SyncTick, p => CDemoSyncTick.decode(p));
/* 004 */ parsers.set(EDemoCommands.DEM_SendTables, p => CDemoSendTables.decode(p));
/* 005 */ parsers.set(EDemoCommands.DEM_ClassInfo, p => CDemoClassInfo.decode(p));
/* 006 */ parsers.set(EDemoCommands.DEM_StringTables, p => CDemoStringTables.decode(p));
/* 007 */ parsers.set(EDemoCommands.DEM_Packet, null);
/* 008 */ parsers.set(EDemoCommands.DEM_SignonPacket, null);
/* 009 */ parsers.set(EDemoCommands.DEM_ConsoleCmd, p => CDemoConsoleCmd.decode(p));
/* 010 */ parsers.set(EDemoCommands.DEM_CustomData, p => CDemoCustomData.decode(p));
/* 011 */ parsers.set(EDemoCommands.DEM_CustomDataCallbacks, p => CDemoCustomDataCallbacks.decode(p));
/* 012 */ parsers.set(EDemoCommands.DEM_UserCmd, p => CDemoUserCmd.decode(p));
/* 013 */ parsers.set(EDemoCommands.DEM_FullPacket, null);
/* 014 */ parsers.set(EDemoCommands.DEM_SaveGame, p => CDemoSaveGame.decode(p));
/* 015 */ parsers.set(EDemoCommands.DEM_SpawnGroups, p => CDemoSpawnGroups.decode(p));
/* 016 */ parsers.set(EDemoCommands.DEM_AnimationData, p => CDemoAnimationData.decode(p));
/* 017 */ parsers.set(EDemoCommands.DEM_AnimationHeader, p => CDemoAnimationHeader.decode(p));

class DemoStreamPacketParser extends Stream.Transform {
    /**
     * @constructor
     * @public
     *
     * @param {Number} concurrency
     */
    constructor(concurrency) {
        super({ objectMode: true });

        this._counts = {
            batches: 0,
            tasks: 0
        };

        this._workerManager = new WorkerManager(concurrency);

        this._pendingTasks = [ ];
    }

    dispose() {
        this._workerManager.terminate();
    }

    async _flush(callback) {
        await Promise.all(this._pendingTasks.map(t => t.promise));

        callback();
    }

    /**
     * @param {Array<DemoPacketRaw>} batch
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     * @private
     */
    async _transform(batch, encoding, callback) {
        this._counts.batches += 1;

        const heavyPackets = [ ];

        batch.forEach((demoPacketRaw) => {
            const commandType = demoPacketRaw.getCommandType();

            PacketTracker.trackDemoPacket(commandType);

            const parser = parsers.get(commandType) || null;

            if (parser === null) {
                heavyPackets.push(demoPacketRaw);
            } else {
                const data = parser(decompress(demoPacketRaw));

                const demoPacket = DemoPacket.fromRaw(demoPacketRaw, data);

                this.push(demoPacket);
            }
        });

        if (heavyPackets.length === 0) {
            callback();

            return;
        }

        const thread = await this._workerManager.requestThread();

        this._counts.tasks += 1;

        const task = new WorkerTask(WorkerTaskType.DEMO_PACKET_PARSE, this._counts.tasks, heavyPackets.map(p => [ p.getIsCompressed(), p.payload ]));

        const promise = this._workerManager.run(thread, task)
            .then((messageBatches) => {
                const index = this._pendingTasks.findIndex(({ task: t }) => t === task);

                if (index >= 0) {
                    this._pendingTasks.splice(index, 1);
                }

                const messagePacketParser = new MessagePacketParser();

                messageBatches.forEach((batch, batchIndex) => {
                    const messagePackets = [ ];

                    batch.forEach(([ messageType, payload ], messageIndex) => {
                        PacketTracker.trackMessagePacket(heavyPackets[batchIndex].getCommandType(), messageType);

                        const messagePacket = messagePacketParser.parse(messageType, payload);

                        messagePackets.push(messagePacket);
                    });

                    const demoPacket = DemoPacket.fromRaw(heavyPackets[batchIndex], messagePackets);

                    this.push(demoPacket);
                });
            });

        this._pendingTasks.push({ task, promise });

        callback();
    }
}

function decompress(demoPacket) {
    let decompressed;

    if (demoPacket.getIsCompressed()) {
        decompressed = SnappyDecompressor.decompress(demoPacket.payload);
    } else {
        decompressed = demoPacket.payload;
    }

    return decompressed;
}

module.exports = DemoStreamPacketParser;

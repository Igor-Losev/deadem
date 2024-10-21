const Stream = require('stream');

const snappy = require('snappy');

const MessagePacketExtractor = require('./../data/MessagePacketExtractor'),
    MessagePacketParser = require('./../data/MessagePacketParser');

const PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory'),
    WorkerTaskType = require('./../data/enums/WorkerTaskType');

const LoggerProvider = require('./../providers/LoggerProvider.instance'),
    ProtoProvider = require('./../providers/ProtoProvider.instance');

const PacketTracker = require('./../trackers/PacketTracker.instance'),
    PerformanceTracker = require('./../trackers/PerformanceTracker.instance');

const WorkerManager = require('./../workers/WorkerManager'),
    WorkerTask = require('./../workers/WorkerTask');

const logger = LoggerProvider.getLogger('DemoStreamPacketParser');

/** demo.proto */
const CDemoPacket = ProtoProvider.DEMO.lookupType('CDemoPacket');
const EDemoCommands = ProtoProvider.DEMO.getEnum('EDemoCommands');

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

        batch.forEach((demoPacket) => {
            PacketTracker.trackDemoPacket(demoPacket.getCommandType());

            switch (demoPacket.getCommandType()) {
                case EDemoCommands.DEM_Error: { // -1
                    break;
                }
                case EDemoCommands.DEM_Stop: { // 0
                    break;
                }
                case EDemoCommands.DEM_FileHeader: { // 1
                    break;
                }
                case EDemoCommands.DEM_FileInfo: { // 2
                    break;
                }
                case EDemoCommands.DEM_SyncTick: { // 3
                    break;
                }
                case EDemoCommands.DEM_SendTables: { // 4
                    break;
                }
                case EDemoCommands.DEM_ClassInfo: { // 5
                    break;
                }
                case EDemoCommands.DEM_StringTables: { // 6
                    break;
                }
                case EDemoCommands.DEM_Packet: // 7
                case EDemoCommands.DEM_SignonPacket: { // 8
                    heavyPackets.push(demoPacket);

                    break;
                }
                case EDemoCommands.DEM_ConsoleCmd: { // 9
                    break;
                }
                case EDemoCommands.DEM_CustomData: { // 10
                    break;
                }
                case EDemoCommands.DEM_CustomDataCallbacks: { // 11
                    break;
                }
                case EDemoCommands.DEM_UserCmd: { // 12
                    break;
                }
                case EDemoCommands.DEM_FullPacket: { // 13
                    heavyPackets.push(demoPacket);

                    break;
                }
                case EDemoCommands.DEM_SaveGame: { // 14
                    break;
                }
                case EDemoCommands.DEM_SpawnGroups: { // 15
                    break;
                }
                case EDemoCommands.DEM_AnimationData: { // 16
                    break;
                }
                case EDemoCommands.DEM_AnimationHeader: { // 17
                    break;
                }
            }
        });

        if (heavyPackets.length > 0) {
            await this._workerManager.ready();

            this._counts.tasks += 1;

            const task = new WorkerTask(WorkerTaskType.PACKET_PARSE, this._counts.tasks, heavyPackets);

            const promise = this._workerManager.run(task)
                .then((data) => {
                    const index = this._pendingTasks.findIndex(({ task: t }) => t === task);

                    if (index >= 0) {
                        this._pendingTasks.splice(index, 1);
                    }

                    data.forEach((batch, index) => {
                        batch.forEach((message) => {
                            PacketTracker.trackMessagePacket(heavyPackets[index].getCommandType(), message._type);
                        });
                    });
                });

            this._pendingTasks.push({ task, promise });
        }

        callback();
    }
}

module.exports = DemoStreamPacketParser;

'use strict';

const Stream = require('stream');

const DemoPacket = require('./../data/DemoPacket'),
    MessagePacket = require('./../data/MessagePacket');

const DemoCommandType = require('./../data/enums/DemoCommandType'),
    MessagePacketType = require('./../data/enums/MessagePacketType'),
    WorkerTaskType = require('./../data/enums/WorkerTaskType');

const SnappyDecompressor = require('./../decompressors/SnappyDecompressor.instance');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const PacketTracker = require('./../trackers/PacketTracker.instance');

const WorkerManager = require('./../workers/WorkerManager'),
    WorkerTask = require('./../workers/WorkerTask');

const logger = LoggerProvider.getLogger('DemoStreamPacketParser');

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
        this._workerTargets = [ DemoCommandType.DEM_PACKET, DemoCommandType.DEM_SIGNON_PACKET, DemoCommandType.DEM_FULL_PACKET ];

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
     * @protected
     * @param {Array<DemoPacketRaw>} batch
     * @param {BufferEncoding} encoding
     * @param {TransformCallback} callback
     * @private
     */
    async _transform(batch, encoding, callback) {
        this._counts.batches += 1;

        batch.forEach((demoPacketRaw) => {
            PacketTracker.trackDemoPacket(demoPacketRaw.getCommandType());
        });

        const getIsHeavy = demoPacketRaw => this._workerTargets.includes(DemoCommandType.parseById(demoPacketRaw.getCommandType()));
        const getIsOther = demoPacketRaw => !getIsHeavy(demoPacketRaw);

        const heavy = batch.filter(getIsHeavy);
        const other = batch.filter(getIsOther);

        other.forEach((demoPacketRaw) => {
            let data;

            if (demoPacketRaw.getIsCompressed()) {
                data = SnappyDecompressor.decompress(demoPacketRaw.payload);
            } else {
                data = demoPacketRaw.payload;
            }

            const demoCommandType = DemoCommandType.parseById(demoPacketRaw.getCommandType());
            const demoTick = demoPacketRaw.tick.value;

            const demoPacket = new DemoPacket(demoCommandType, demoTick, demoCommandType.proto.decode(data));

            this.push(demoPacket);
        });

        if (heavy.length > 0) {
            const thread = await this._workerManager.requestThread();

            this._processAsync(thread, heavy)
                .then((demoPackets) => {
                    demoPackets.forEach((demoPacket) => {
                        this.push(demoPacket);
                    });
                });
        }

        callback();
    }

    /**
     * @protected
     * @param {WorkerThread} thread
     * @param {Array<DemoPacketRaw>} batch
     * @returns {Promise<Array<DemoPacket>>}
     */
    _processAsync(thread, batch) {
        const taskId = ++this._counts.tasks;
        const task = new WorkerTask(WorkerTaskType.DEMO_PACKET_PARSE, taskId, batch.map(p => [ p.getIsCompressed(), p.payload ]));

        const promise = this._workerManager.run(thread, task);

        this._pendingTasks.push({ task, promise });

        return promise
            .then((messageBatches) => {
                const taskIndex = this._pendingTasks.findIndex(({ task: t }) => t === task);

                if (taskIndex >= 0) {
                    this._pendingTasks.splice(taskIndex, 1);
                }

                const demoPackets = [ ];

                messageBatches.forEach((messageBatch, batchIndex) => {
                    const demoPacketRaw = batch[batchIndex];

                    const messagePackets = [ ];

                    messageBatch.forEach(([ messageType, payload ]) => {
                        PacketTracker.trackMessagePacket(batch[batchIndex].getCommandType(), messageType);

                        const messagePacketType = MessagePacketType.parseById(messageType) || null;

                        if (messagePacketType === null) {
                            return;
                        }

                        const data = messagePacketType.proto.decode(payload);

                        const messagePacket = new MessagePacket(messagePacketType, data);

                        messagePackets.push(messagePacket);
                    });

                    const demoCommandType = DemoCommandType.parseById(demoPacketRaw.getCommandType());
                    const demoTick = demoPacketRaw.tick.value;

                    const demoPacket = new DemoPacket(demoCommandType, demoTick, messagePackets);

                    demoPackets.push(demoPacket);
                });

                return demoPackets;
            });
    }
}

module.exports = DemoStreamPacketParser;

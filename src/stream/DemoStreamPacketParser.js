const Stream = require('stream');

const snappy = require('snappy');

const MessagePacketExtractor = require('./../data/MessagePacketExtractor'),
    MessagePacketParser = require('./../data/MessagePacketParser');

const PerformanceTrackerCategory = require('./../data/enums/PerformanceTrackerCategory');

const LoggerProvider = require('./../providers/LoggerProvider.instance'),
    ProtoProvider = require('./../providers/ProtoProvider.instance');

const PacketTracker = require('./../trackers/PacketTracker.instance'),
    PerformanceTracker = require('./../trackers/PerformanceTracker.instance');

const WorkerManager = require('./../workers/WorkerManager'),
    WorkerParseTask = require('./../workers/WorkerParseTask');

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
            batches: 0
        };

        this._workerManager = new WorkerManager(concurrency);

        this._pending = [ ];
    }

    dispose() {
        this._workerManager.terminate();
    }

    async _flush(callback) {
        await Promise.all(this._pending);

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

        // console.log(batch.length);

        batch.forEach((demoPacket) => {
            PacketTracker.trackDemoPacket(demoPacket.getCommandType());
        });

        await this._workerManager.ready();

        const taskId = this._counts.batches;
        const task = new WorkerParseTask(taskId, batch);

        const promise = this._workerManager.run(task)
            .then((result) => {
                const index = this._pending.indexOf(promise);

                if (index >= 0) {
                    this._pending.splice(index, 1);
                }

                result.forEach((item) => {
                    const { command, packets } = item;

                    packets.forEach((type) => {
                        PacketTracker.trackMessagePacket(command, type);
                    });
                });
            });

        this._pending.push(promise);

        callback();
    }
}

module.exports = DemoStreamPacketParser;

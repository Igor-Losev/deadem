import Queue from '#core/Queue.js';
import Semaphore from '#core/Semaphore.js';

import TransformStream from '#core/stream/TransformStream.js';

import WorkerRequestDPacketRawBatchSync from '#workers/requests/WorkerRequestDPacketRawBatchSync.js';

class DemoStreamLoadBalancer extends TransformStream {
    /**
     * @public
     * @constructor
     *
     * @param {ParserEngine} engine
     */
    constructor(engine) {
        super();

        this._engine = engine;

        this._loadBalancer = new LoadBalancer(engine, this._handleResponse.bind(this));
    }

    /**
     * @protected
     * @returns {Promise<void>}
     */
    async _finalize() {
        await Promise.all(this._engine.workerManager.threads.map(t => t.deferred?.promise || Promise.resolve()));
    }

    /**
     * @protected
     * @param {DemoPacketRawBatch} batch
     */
    async _handle(batch) {
        this._engine.recorder.record(batch);

        const partition = batch.partition;

        if (partition === 0) {
            const request = new WorkerRequestDPacketRawBatchSync(batch, [ ]);

            const responses = await this._engine.workerManager.broadcast(request);

            this._handleResponse(request, responses[0]);
        } else {
            await this._loadBalancer.handle(batch);
        }
    }

    /**
     * @protected
     * @param {WorkerRequestDPacketRawBatchSync} request
     * @param {WorkerResponseDPacketRawBatchSync} response
     * @private
     */
    _handleResponse(request, response) {
        this._push([ request.payload.batch, response.payload ]);
    }
}

class LoadBalancer {
    /**
     * @public
     * @param {ParserEngine} engine
     * @param {Function} callback
     */
    constructor(engine, callback) {
        this._assignments = new Map();
        this._channels = new Map();
        this._gate = new Semaphore(engine.workerManager.threads.length);
        this._partition = 0;
        this._pool = engine.workerManager.threads.map(t => t.localId);
        this._synchronization = new Map();

        this._engine = engine;
        this._callback = callback;
    }

    /**
     * @public
     * @param {DemoPacketRawBatch} batch
     */
    async handle(batch) {
        const partition = batch.partition;

        if (this._partition !== partition) {
            this._partition = partition;

            await this._gate.acquire();
        }

        const existing = this._channels.has(partition);

        if (existing) {
            const channel = this._channels.get(partition);

            channel.enqueue(batch);
        } else {
            const channel = new Queue();

            this._channels.set(batch.partition, channel);

            channel.enqueue(batch);

            const runner = async () => {
                if (channel.size === 0) {
                    this._gate.release();

                    const threadId = this._assignments.get(partition);

                    this._pool.push(threadId);

                    return;
                }

                const dequeued = channel.dequeue();

                let snapshots;
                let threadId;

                if (this._assignments.has(dequeued.partition)) {
                    threadId = this._assignments.get(dequeued.partition);

                    snapshots = [ ];
                } else {
                    threadId = this._pool[0];

                    this._pool = this._pool.filter(tId => tId !== threadId);

                    this._assignments.set(dequeued.partition, threadId);

                    const lastSnapshot = this._synchronization.get(threadId) || 1;

                    snapshots = this._engine.recorder.snapshots.slice(lastSnapshot, batch.partition);

                    this._synchronization.set(threadId, batch.partition);
                }

                const thread = await this._engine.workerManager.allocate(threadId);

                const request = new WorkerRequestDPacketRawBatchSync(dequeued, snapshots);

                thread.send(request)
                    .then((response) => {
                        this._engine.workerManager.free(thread);

                        this._callback(request, response);

                        runner();
                    });
            };

            runner();
        }
    }
}

export default DemoStreamLoadBalancer;

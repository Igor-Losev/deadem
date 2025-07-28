import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import DemoPacketRaw from '#data/DemoPacketRaw.js';
import DemoPacketRawBatch from '#data/DemoPacketRawBatch.js';

import WorkerRequest from './WorkerRequest.js';

class WorkerRequestDPacketRawBatchSync extends WorkerRequest {
    /**
     * @constructor
     * @param {DemoPacketRawBatch} batch
     * @param {Array<DemoPacketRaw>} snapshots
     */
    constructor(batch, snapshots) {
        super(WorkerMessageType.DEMO_PACKET_RAW_BATCH_SYNC, { batch, snapshots }, [ ]);
    }

    /**
     * @public
     * @static
     * @param {RequestDPacketRawBatch} raw
     * @returns {WorkerRequestDPacketRawBatchSync}
     */
    static deserialize(raw) {
        return new WorkerRequestDPacketRawBatchSync(
            DemoPacketRawBatch.fromObject(raw.batch),
            raw.snapshots.map(s => DemoPacketRaw.fromObject(s))
        );
    }

    /**
     * @protected
     * @returns {WorkerRequestRaw}
     */
    _serialize() {
        return super._serialize({
            batch: this._payload.batch.toObject(),
            snapshots: this._payload.snapshots.map(s => s.toObject())
        });
    }
}

/**
 * @typedef {Object} RequestDPacketRawBatch
 * @property {DemoPacketRawBatchObject} batch
 * @property {Array<DemoPacketRawObject>} snapshots
 */

export default WorkerRequestDPacketRawBatchSync;

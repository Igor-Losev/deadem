import MessagePacketRaw from '#data/MessagePacketRaw.js';

import WorkerMessageType from '#data/enums/WorkerMessageType.js';

import WorkerResponse from './WorkerResponse.js';

class WorkerResponseDHPParse extends WorkerResponse {
    /**
     * @constructor
     * @param {Array<Array<MessagePacketRaw>>|Array<Array<MessagePacketRawPacked>>} batches
     * @param {Array<Uint8Array|null>} stringTables 
     */
    constructor(batches, stringTables) {
        super(WorkerMessageType.DEMO_HEAVY_PACKET_PARSE, { batches, stringTables }, [ ]);
    }

    /**
     * @public
     * @static
     * @param {{ batches: Array<Array<MessagePacketRawPacked>>, stringTables: Array<Uint8Array|null> }} packed
     * @returns {WorkerResponseDHPParse}
     */
    static deserialize(packed) {
        const batches = [ ];

        for (let batchIndex = 0; batchIndex < packed.batches.length; batchIndex += 1) {
            const batch = [ ];

            const { meta, buffer } = packed.batches[batchIndex];

            for (let index = 0; index < meta.length; index += 3) {
                const type = meta[index];
                const pointer = meta[index + 1];
                const size = meta[index + 2];

                batch.push(new MessagePacketRaw(type, size, buffer.subarray(pointer, pointer + size)));
            }

            batches.push(batch);
        }

        return new WorkerResponseDHPParse(batches, packed.stringTables);
    }

    /**
     * @protected
     * @returns {WorkerResponseRaw}
     */
    _serialize() {
        return super._serialize(this._payload);
    }
}

export default WorkerResponseDHPParse;

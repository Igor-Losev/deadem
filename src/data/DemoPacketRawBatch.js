import DemoPacketRaw from '#data/DemoPacketRaw.js';

class DemoPacketRawBatch {
    /**
     * @constructor
     *
     * @param {number} sequence
     * @param {number} partition
     * @param {Array<DemoPacketRaw>} packets
     */
    constructor(sequence, partition, packets) {
        this._sequence = sequence;
        this._partition = partition;
        this._packets = packets;
    }

    /**
     * @public
     * @returns {number}
     */
    get sequence() {
        return this._sequence;
    }

    /**
     * @public
     * @returns {number}
     */
    get partition() {
        return this._partition;
    }

    /**
     * @public
     * @returns {Array<DemoPacketRaw>}
     */
    get packets() {
        return this._packets
    }

    /**
     * @public
     * @static
     * @param {DemoPacketRawBatchObject} object
     * @returns {DemoPacketRawBatch}
     */
    static fromObject(object) {
        return new DemoPacketRawBatch(object.sequence, object.partition, object.packets.map(p => DemoPacketRaw.fromObject(p)));
    }

    /**
     * @public
     * @returns {DemoPacketRawBatchObject}
     */
    toObject() {
        return {
            sequence: this._sequence,
            partition: this._partition,
            packets: this._packets.map(p => p.toObject())
        };
    }
}

/**
 * @typedef {Object} DemoPacketRawBatchObject
 * @property {number} sequence
 * @property {number} partition
 * @property {Array<DemoPacketRawObject>} packets
 */

export default DemoPacketRawBatch;

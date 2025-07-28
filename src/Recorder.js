import DemoPacketType from '#data/enums/DemoPacketType.js';

class Recorder {
    constructor() {
        this._packets = [ ];
        this._snapshots = [ ];
    }

    /**
     * @public
     * @returns {Array<DemoPacketRaw>}
     */
    get snapshots() {
        return this._snapshots;
    }

    /**
     * @public
     * @param {DemoPacketRawBatch} batch
     */
    record(batch) {
        batch.packets.forEach((demoPacketRaw) => {
            this._packets.push(demoPacketRaw);

            if (demoPacketRaw.getTypeId() === DemoPacketType.DEM_FULL_PACKET.id) {
                this._snapshots[batch.partition] = demoPacketRaw;
            }
        });
    }
}

export default Recorder;

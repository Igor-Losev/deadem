import Assert from './../../core/Assert.js';

class PacketTrackRecord {
    constructor(id) {
        Assert.isTrue(Number.isInteger(id));

        this._id = id;
        this._count = 0;

        this._records = new Map();
    }

    get id() {
        return this._id;
    }

    get count() {
        return this._count;
    }

    get records() {
        return this._records;
    }

    /**
     * @public
     */
    touch() {
        this._count += 1;
    }

    /**
     * @public
     */
    track(id) {
        Assert.isTrue(Number.isInteger(id));

        const record = this._records.get(id) || new PacketTrackRecord(id);

        record.touch();

        this._records.set(id, record);
    }
}

export default PacketTrackRecord;

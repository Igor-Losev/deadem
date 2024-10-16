const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('DemoPacketTracker');

class DemoPacketTracker {
    constructor() {
        this._records = new Map();
    }

    /**
     * @public
     * @param {DemoPacket} packet
     */
    trackPacket(packet) {
        const type = packet.getMessageType();

        const record = this._records.get(type) || new TrackRecord(type);

        record.increment();

        this._records.set(type, record);
    }

    /**
     * @public
     * @param {DemoPacket} packet
     * @param {DemoPacketMessage} packetMessage
     */
    trackPacketMessage(packet, packetMessage) {
        const type = packet.getMessageType();

        const record = this._records.get(type) || new TrackRecord(type);

        const subRecord = record.records.get(packetMessage.type) || new TrackRecord(packetMessage.type);

        subRecord.increment();

        record.records.set(packetMessage.type, subRecord);
    }

    print() {
        logger.info(`----- <DemoPacketTracker> -----`);

        const keys = [ ];

        this._records.forEach((_, key) => {
            keys.push(key);
        });

        keys.sort((a, b) => a - b);

        keys.forEach((key) => {
            const record = this._records.get(key);

            logger.info(`[ ${key} ] type: [ ${record.count.toLocaleString('en-US')} ] message(s)`);

            if (record.records.size > 0) {
                const subKeys = [ ];

                record.records.forEach((_, key) => {
                    subKeys.push(key);
                });

                subKeys.sort((a, b) => a - b);

                subKeys.forEach((subkey) => {
                    const subrecord = record.records.get(subkey);

                    logger.info(`\t[ ${key}|${subkey} ] type: [ ${subrecord.count.toLocaleString('en-US')} ] message(s)`);
                });
            }
        });

        logger.info(`----- </DemoPacketTracker> -----`);
    }

    static instance = new DemoPacketTracker();
}

class TrackRecord {
    constructor(id) {
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

    increment() {
        this._count += 1;
    }
}

module.exports = DemoPacketTracker.instance;

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('DemoPacketTracker');

class PacketTracker {
    constructor() {
        this._records = new Map();
    }

    /**
     * @public
     * @param {DemoPacket} demoPacket
     */
    trackDemoPacket(demoPacket) {
        const commandType = demoPacket.getCommandType();

        const record = this._records.get(commandType) || new TrackRecord(commandType);

        record.increment();

        this._records.set(commandType, record);
    }

    /**
     * @public
     * @param {DemoPacket} demoPacket
     * @param {MessagePacket} messagePacket
     */
    trackMessagePacket(demoPacket, messagePacket) {
        const commandType = demoPacket.getCommandType();

        const record = this._records.get(commandType) || new TrackRecord(commandType);

        const subRecord = record.records.get(messagePacket.type) || new TrackRecord(messagePacket.type);

        subRecord.increment();

        record.records.set(messagePacket.type, subRecord);
    }

    print() {
        logger.info(`----- <PacketTracker> -----`);

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

        logger.info(`----- </PacketTracker> -----`);
    }

    static instance = new PacketTracker();
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

module.exports = PacketTracker.instance;

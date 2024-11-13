'use strict';

const PacketTrackRecord = require('./../data/trackers/PacketTrackRecord');

const LoggerProvider = require('./../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('PacketTracker');

class PacketTracker {
    /**
     * @public
     * @constructor
     */
    constructor() {
        this._registry = new Map();
    }

    /**
     * @public
     * @param {DemoPacket} demoPacket
     */
    handleDemoPacket(demoPacket) {
        const identifier = demoPacket.command.id;

        const record = this._registry.get(identifier) || new PacketTrackRecord(identifier);

        record.touch();

        this._registry.set(identifier, record);
    }

    /**
     * @public
     * @param {DemoPacket} demoPacket
     * @param {MessagePacket} messagePacket
     */
    handleMessagePacket(demoPacket, messagePacket) {
        const identifier = demoPacket.command.id;

        const record = this._registry.get(identifier) || null;

        if (record === null) {
            throw new Error(`Unable to track message packet: demo packet doesn't exist`);
        }

        record.track(messagePacket.type.id);
    }

    /**
     * @public
     */
    print() {
        const format = n => n.toLocaleString('en-US');
        const highlight = s => `----- ${s} -----`;
        const log = (type, count, depth = 0) => logger.info(`${'\t'.repeat(depth)}[ ${type} ] type: [ ${format(count)} ] packet(s)`);

        logger.info(highlight('<PacketTracker>'));

        const keys = Array.from(this._registry.keys());

        keys.sort((a, b) => a - b);

        keys.forEach((key) => {
            const record = this._registry.get(key);

            log(key, record.count);

            if (record.records.size > 0) {
                const subKeys = Array.from(record.records.keys());

                subKeys.sort((a, b) => a - b);

                subKeys.forEach((subKey) => {
                    const subRecord = record.records.get(subKey);

                    log(`${key}|${subKey}`, subRecord.count, 1);
                });
            }
        });

        logger.info(highlight('</PacketTracker>'));
    }
}

module.exports = PacketTracker;

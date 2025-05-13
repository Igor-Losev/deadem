'use strict';

const MessagePacketType = require('./../data/enums/MessagePacketType');

const PacketTrackRecord = require('./../data/trackers/PacketTrackRecord');

const Tracker = require('./Tracker');

class PacketTracker extends Tracker {
    /**
     * @constructor
     * @param {Logger} logger
     */
    constructor(logger) {
        super(logger);

        this._registry = new Map();
        this._unknown = new Map();
    }

    /**
     * @public
     * @param {DemoPacket} demoPacket
     */
    handleDemoPacket(demoPacket) {
        const identifier = demoPacket.command.id;

        this._logger.trace(`${demoPacket.sequence} ${demoPacket.command.code}`);

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

        this._logger.trace(`\t ${messagePacket.type.code}`);

        const record = this._registry.get(identifier) || null;

        if (record === null) {
            throw new Error(`Unable to track message packet: demo packet doesn't exist`);
        }

        record.track(messagePacket.type.id);
    }

    /**
     * @public
     * @param {number} messageType
     */
    handleUnknownMessagePacket(messageType) {
        const count = this._unknown.get(messageType) || 0;

        this._unknown.set(messageType, count + 1);
    }

    /**
     * @public
     */
    print() {
        const open = this._highlight('<PacketTracker>');
        const close = this._highlight('</PacketTracker>');

        const log = (type, count, depth = 0) => this._logger.debug(`${'\t'.repeat(depth)}[ ${type} ] type: [ ${this._formatNumber(count)} ] packet(s)`);

        this._logger.debug(open);

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

                    const packetType = MessagePacketType.parseById(subKey);

                    const suffix = packetType ? `${packetType.code}` : '';

                    log(`${key}|${subKey} ] - [ ${suffix}`, subRecord.count, 1);
                });
            }
        });

        const unknownKeys = Array.from(this._unknown.keys());

        unknownKeys.sort((a, b) => a - b);

        this._logger.debug(this._highlight('Unhandled Messages'));

        unknownKeys.forEach((key) => {
            const count = this._unknown.get(key);

            log(key.toString(), count);
        });

        this._logger.debug(close);
    }
}

module.exports = PacketTracker;

import Logger from '#core/Logger.js';

import DemoPacketType from '#data/enums/DemoPacketType.js';
import MessagePacketType from '#data/enums/MessagePacketType.js';

class Printer {
    /**
     * @constructor
     * @param {Parser} parser
     * @param {Logger} logger
     */
    constructor(parser, logger = Logger.CONSOLE_INFO) {
        this._parser = parser;
        this._logger = logger;
    }

    /**
     * @public
     */
    printStats() {
        const stats = this._parser.getStats();

        this._printMemoryStats(stats.memory);
        this._printPacketStats(stats.packet);
        this._printPerformanceStats(stats.performance);
    }

    /**
     * @public
     */
    printMemoryStats() {
        const stats = this._parser.getStats();

        this._printMemoryStats(stats.memory);
    }

    /**
     * @public
     */
    printPacketStats() {
        const stats = this._parser.getStats();

        this._printPacketStats(stats.packet);
    }

    /**
     * @public
     */
    printPerformanceStats() {
        const stats = this._parser.getStats();

        this._printPerformanceStats(stats.performance);
    }

    /**
     * @protected
     * @param {number} n
     * @returns {string}
     */
    _formatNumber(n) {
        return n.toLocaleString('ru-RU');
    }

    /**
     * @protected
     * @param {String} text
     * @returns {String}
     */
    _highlight(text) {
        return `===== ${text} =====`;
    }

    /**
     * @protected
     * @param {number} depth
     * @returns {string}
     */
    _indent(depth) {
        return `${'\t'.repeat(depth)}`;
    }

    /**
     * @protected
     * @param {...*} args
     */
    _log(...args) {
        this._logger.info(...args);
    }

    /**
     * @protected
     * @param {MemoryTrackerStats} memoryStats
     */
    _printMemoryStats(memoryStats) {
        this._log(this._highlight('<Memory>'));

        this._logger.info(`Max Memory Usage: [ ${this._formatNumber(bytesToMegabytes(memoryStats.maxMemoryUsage))} ] MB`);

        this._log(this._highlight('</Memory>'));
    }

    /**
     * @protected
     * @param {PacketTrackerStats} packetStats
     */
    _printPacketStats(packetStats) {
        this._log(this._highlight('<Packets.Parsed>'));

        this._printPacketStatsPartition(packetStats.parsed);

        this._log(this._highlight('</Packets.Parsed>'));

        this._log(this._highlight('<Packets.Skipped>'));

        this._printPacketStatsPartition(packetStats.unparsed);

        this._log(this._highlight('</Packets.Skipped>'));
    }

    /**
     * @protected
     * @param {Array<PacketTrackerUnpackedItem>} partition
     */
    _printPacketStatsPartition(partition) {
        partition.forEach((parent) => {
            const demoPacketType = DemoPacketType.parseById(parent.type) || null;

            const parentCode = demoPacketType === null ? 'Unknown' : demoPacketType.code;

            this._log(`[ ${parent.type} ] [ ${parentCode} ]: [ ${this._formatNumber(parent.count)} ] packet(s)`);

            const indent = this._indent(1);

            parent.children.forEach((child) => {
                const messagePacketType = MessagePacketType.parseById(child.type) || null;

                const childCode = messagePacketType === null ? 'Unknown' : messagePacketType.code;

                this._logger.info(`${indent}[ ${child.type} ] [ ${childCode} ]: [ ${this._formatNumber(child.count)} ] packet(s)`);
            });
        });
    }

    /**
     * @protected
     * @param {PerformanceTrackerStats} performanceStats
     */
    _printPerformanceStats(performanceStats) {
        this._log(this._highlight('<Performance>'));

        const walk = (node, depth = 0) => {
            const indent = this._indent(depth);

            const avg = this._formatNumber(node.stats.avg);
            const count = this._formatNumber(node.stats.count);
            const total = this._formatNumber(node.stats.sum);

            this._log(`${indent}[ ${node.category.code} ]: total [ ${total} ] ms, [ ${count} ] run(s) with [ ${avg} ] ms in average`);

            node.children.forEach((child) => {
                walk(child, depth + 1);
            });
        };

        walk(performanceStats);

        this._log(this._highlight('</Performance>'));
    }
}

function bytesToMegabytes(bytes) {
    return bytes / (1024 * 1024);
}

export default Printer;

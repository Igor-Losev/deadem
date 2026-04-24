import Logger from '#core/Logger.js';

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

        this._logger.info(`Max Memory Usage: [ ${formatMegabytes(this._formatNumber.bind(this), memoryStats.maxMemoryUsage)} ] MB`);
        this._logger.info(`Max Heap Used: [ ${formatMegabytes(this._formatNumber.bind(this), memoryStats.maxHeapUsed)} ] MB`);
        this._logger.info(`Max External Usage: [ ${formatMegabytes(this._formatNumber.bind(this), memoryStats.maxExternalUsage)} ] MB`);
        this._logger.info(`Max ArrayBuffer Usage: [ ${formatMegabytes(this._formatNumber.bind(this), memoryStats.maxArrayBufferUsage)} ] MB`);
        this._logger.info(`Max RSS: [ ${formatMegabytes(this._formatNumber.bind(this), memoryStats.maxResidentSetSize)} ] MB`);

        this._log(this._highlight('</Memory>'));
    }

    /**
     * @protected
     * @param {PacketTrackerStats} packetStats
     */
    _printPacketStats(packetStats) {
        if (packetStats.parsed.length > 0) {
            this._log(this._highlight('<Packets.Parsed>'));

            this._printPacketStatsPartition(packetStats.parsed);

            this._log(this._highlight('</Packets.Parsed>'));
        }

        if (packetStats.unparsed.length > 0) {
            this._log(this._highlight('<Packets.Skipped>'));

            this._printPacketStatsPartition(packetStats.unparsed);

            this._log(this._highlight('</Packets.Skipped>'));
        }
    }

    /**
     * @protected
     * @param {Array<PacketTrackerUnpackedItem>} partition
     */
    _printPacketStatsPartition(partition) {
        const getColumnForType = type => `${type}`.padStart(3, '0'); 
        const getColumnForCode = code => `${code}`.padEnd(40, ' '); 
        const getColumnForCount = count => `${count}`.padStart(10, ' ');

        partition.forEach((parent) => {
            const indent = this._indent(1);

            this._log(`[ ${getColumnForType(parent.type)} ] ${indent}[ ${getColumnForCode(parent.code)} ]: [ ${getColumnForCount(this._formatNumber(parent.count))} ] packet(s)`);

            parent.children.forEach((child) => {
                this._logger.info(`${indent}[ ${getColumnForType(child.type)} ] [ ${getColumnForCode(child.code)} ]: [ ${getColumnForCount(this._formatNumber(child.count))} ] packet(s)`);
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

/**
 * @param {(n: number) => string} formatNumber
 * @param {number|null} bytes
 * @returns {string}
 */
function formatMegabytes(formatNumber, bytes) {
    if (bytes === null) {
        return 'N/A';
    }

    return formatNumber(bytesToMegabytes(bytes));
}

export default Printer;

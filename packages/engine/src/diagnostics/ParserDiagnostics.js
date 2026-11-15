/** @import { MemoryTrackerStats } from './trackers/MemoryTracker.base.js' */
/** @import { PacketTrackerStats } from './trackers/PacketTracker.js' */
/** @import { PerformanceTrackerStats } from './trackers/PerformanceTracker.js' */

import Assert from '../core/Assert.js';
import Logger from '../core/Logger.js';

import MemoryTracker from '#diagnostics/trackers/MemoryTracker.js';
import PacketTracker from './trackers/PacketTracker.js';
import PerformanceTracker from './trackers/PerformanceTracker.js';

/**
 * Logger and trackers that the engine and its streams report to.
 */
class ParserDiagnostics {
    /** @private @type {Logger} */
    _logger;

    /** @private @type {MemoryTracker} */
    _memory;

    /** @private @type {PacketTracker} */
    _packet;

    /** @private @type {PerformanceTracker} */
    _performance;

    /**
     * @public
     * @param {Logger} logger
     * @param {MemoryTracker} memoryTracker
     * @param {PacketTracker} packetTracker
     * @param {PerformanceTracker} performanceTracker
     */
    constructor(logger, memoryTracker, packetTracker, performanceTracker) {
        Assert.isTrue(logger instanceof Logger, 'Invalid logger: expected an instance of Logger');
        Assert.isTrue(memoryTracker instanceof MemoryTracker, 'Invalid memoryTracker: expected an instance of MemoryTracker');
        Assert.isTrue(packetTracker instanceof PacketTracker, 'Invalid packetTracker: expected an instance of PacketTracker');
        Assert.isTrue(performanceTracker instanceof PerformanceTracker, 'Invalid performanceTracker: expected an instance of PerformanceTracker');

        this._logger = logger;
        this._memory = memoryTracker;
        this._packet = packetTracker;
        this._performance = performanceTracker;
    }

    /**
     * @public
     * @returns {Logger}
     */
    get logger() {
        return this._logger;
    }

    /**
     * @public
     * @returns {MemoryTracker}
     */
    get memory() {
        return this._memory;
    }

    /**
     * @public
     * @returns {PacketTracker}
     */
    get packet() {
        return this._packet;
    }

    /**
     * @public
     * @returns {PerformanceTracker}
     */
    get performance() {
        return this._performance;
    }

    /**
     * @public
     * @returns {{memory: MemoryTrackerStats, performance: PerformanceTrackerStats, packet: PacketTrackerStats}}
     */
    getStats() {
        return {
            memory: this._memory.getStats(),
            packet: this._packet.getStats(),
            performance: this._performance.getStats()
        };
    }
}

export default ParserDiagnostics;

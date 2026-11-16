/** @import { MemoryTrackerStats } from './trackers/MemoryTracker.base.js' */
/** @import { PacketTrackerStats } from './trackers/PacketTracker.js' */
/** @import { PerformanceTrackerStats } from './trackers/PerformanceTracker.js' */

import Assert from '../core/Assert.js';
import Logger from '../core/Logger.js';

import SchemaRegistry from '../schema/SchemaRegistry.js';

import MemoryTracker from '#diagnostics/trackers/MemoryTracker.js';

import PacketTracker from './trackers/PacketTracker.js';
import PerformanceTracker from './trackers/PerformanceTracker.js';

/**
 * Container for diagnostic classes.
 */
class ParserDiagnostics {
    /** @private @type {Logger} */
    _logger;

    /** @private @type {{memory: MemoryTracker, packet: PacketTracker, performance: PerformanceTracker}} */
    _trackers;

    /**
     * @public
     * @param {SchemaRegistry} registry
     * @param {Logger} logger
     */
    constructor(registry, logger) {
        Assert.isTrue(registry instanceof SchemaRegistry, 'Invalid registry: expected an instance of SchemaRegistry');
        Assert.isTrue(logger instanceof Logger, 'Invalid logger: expected an instance of Logger');

        this._logger = logger;

        this._trackers = {
            memory: new MemoryTracker(),
            packet: new PacketTracker(registry),
            performance: new PerformanceTracker()
        };
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
        return this._trackers.memory;
    }

    /**
     * @public
     * @returns {PacketTracker}
     */
    get packet() {
        return this._trackers.packet;
    }

    /**
     * @public
     * @returns {PerformanceTracker}
     */
    get performance() {
        return this._trackers.performance;
    }

    /**
     * @public
     * @returns {{memory: MemoryTrackerStats, performance: PerformanceTrackerStats, packet: PacketTrackerStats}}
     */
    getStats() {
        return {
            memory: this._trackers.memory.getStats(),
            packet: this._trackers.packet.getStats(),
            performance: this._trackers.performance.getStats()
        };
    }
}

export default ParserDiagnostics;

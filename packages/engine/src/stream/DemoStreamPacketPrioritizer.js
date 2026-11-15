/** @import DemoPacket from '../data/DemoPacket.js' */

import Assert from '../core/Assert.js';

import Transform from '#core/stream/Transform.js';

import DemoPacketPrioritizer from '../processing/DemoPacketPrioritizer.js';

import ParserConfiguration from '../ParserConfiguration.js';

/**
 * Handles prioritization of internal messages for
 * packets of the following types:
 *
 * - {@link DemoPacketType.DEM_PACKET}
 * - {@link DemoPacketType.DEM_SIGNON_PACKET}
 * - {@link DemoPacketType.DEM_FULL_PACKET}
 *
 * All other packet types are passed through unchanged.
 *
 * Stream wrapper around {@link DemoPacketPrioritizer}.
 */
class DemoStreamPacketPrioritizer extends Transform {
    /** @private @type {DemoPacketPrioritizer} */
    _prioritizer;

    /**
     * @public
     * @constructor
     * @param {ParserConfiguration} configuration
     * @param {DemoPacketPrioritizer} prioritizer
     */
    constructor(configuration, prioritizer) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof ParserConfiguration, 'Invalid configuration: expected an instance of ParserConfiguration');
        Assert.isTrue(prioritizer instanceof DemoPacketPrioritizer, 'Invalid prioritizer: expected an instance of DemoPacketPrioritizer');

        this._prioritizer = prioritizer;
    }

    /**
     * @protected
     * @param {DemoPacket} demoPacket
     */
    async _handle(demoPacket) {
        this._prioritizer.prioritize(demoPacket);

        this._push(demoPacket);
    }
}

export default DemoStreamPacketPrioritizer;

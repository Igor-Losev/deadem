/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */

import Assert from '../core/Assert.js';

import Transform from '#core/stream/Transform.js';

import ParserConfiguration from '../ParserConfiguration.js';

/**
 * Assigns sequential {@link DemoPacketRaw#ordinal} values (0, 1, 2, ...)
 * to packets passing through the stream. This is used during replay
 * to preserve arrival order, regardless of their original
 * {@link DemoPacketRaw#sequence}.
 */
class DemoStreamPacketResequencer extends Transform {
    /** @private */
    _ordinal = 0;

    /**
     * @public
     * @constructor
     * @param {ParserConfiguration} configuration
     */
    constructor(configuration) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof ParserConfiguration, 'Invalid configuration: expected an instance of ParserConfiguration');
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     */
    async _handle(demoPacketRaw) {
        demoPacketRaw.ordinal = this._ordinal;

        this._ordinal += 1;

        this._push(demoPacketRaw);
    }
}

export default DemoStreamPacketResequencer;

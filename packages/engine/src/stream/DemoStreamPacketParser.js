/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */

import Assert from '../core/Assert.js';

import Transform from '#core/stream/Transform.js';

import DemoPacketParser from '../processing/DemoPacketParser.js';

import ParserConfiguration from '../ParserConfiguration.js';

/**
 * Given a stream of {@link DemoPacketRaw}, parses its payload.
 * Tracks unparsed demo and message packets.
 *
 * Stream wrapper around {@link DemoPacketParser}.
 */
class DemoStreamPacketParser extends Transform {
    /** @private @type {DemoPacketParser} */
    _parser;

    /**
     * @constructor
     * @public
     * @param {ParserConfiguration} configuration
     * @param {DemoPacketParser} parser
     */
    constructor(configuration, parser) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof ParserConfiguration, 'Invalid configuration: expected an instance of ParserConfiguration');
        Assert.isTrue(parser instanceof DemoPacketParser, 'Invalid parser: expected an instance of DemoPacketParser');

        this._parser = parser;
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     */
    async _handle(demoPacketRaw) {
        const demoPacket = this._parser.parse(demoPacketRaw);

        if (demoPacket === null) {
            return;
        }

        this._push(demoPacket);
    }
}

export default DemoStreamPacketParser;

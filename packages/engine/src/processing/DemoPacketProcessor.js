/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */
/** @import StringTableMutationEvent from '../data/tables/string/StringTableMutationEvent.js' */

import Assert from '../core/Assert.js';

import DemoPacketApplier from './DemoPacketApplier.js';
import DemoPacketParser from './DemoPacketParser.js';
import DemoPacketPrioritizer from './DemoPacketPrioritizer.js';

/**
 * Processes {@link DemoPacketRaw} in arrival order: assigns
 * {@link DemoPacketRaw#ordinal} (0, 1, 2, ...), then parses,
 * prioritizes and applies the packet.
 */
class DemoPacketProcessor {
    /** @private @type {DemoPacketApplier} */
    _applier;

    /** @private */
    _ordinal = 0;

    /** @private @type {DemoPacketParser} */
    _parser;

    /** @private @type {DemoPacketPrioritizer} */
    _prioritizer;

    /**
     * @public
     * @constructor
     * @param {DemoPacketParser} parser
     * @param {DemoPacketPrioritizer} prioritizer
     * @param {DemoPacketApplier} applier
     */
    constructor(parser, prioritizer, applier) {
        Assert.isTrue(parser instanceof DemoPacketParser, 'Invalid parser: expected an instance of DemoPacketParser');
        Assert.isTrue(prioritizer instanceof DemoPacketPrioritizer, 'Invalid prioritizer: expected an instance of DemoPacketPrioritizer');
        Assert.isTrue(applier instanceof DemoPacketApplier, 'Invalid applier: expected an instance of DemoPacketApplier');

        this._applier = applier;
        this._parser = parser;
        this._prioritizer = prioritizer;
    }

    /**
     * @public
     * @param {DemoPacketRaw} demoPacketRaw
     * @param {Array<StringTableMutationEvent>|null} [snapshotEvents=null] - String table snapshots of a seek. Applied before the messages.
     */
    process(demoPacketRaw, snapshotEvents = null) {
        demoPacketRaw.ordinal = this._ordinal;

        this._ordinal += 1;

        const demoPacket = this._parser.parse(demoPacketRaw);

        if (demoPacket === null) {
            return;
        }

        this._prioritizer.prioritize(demoPacket);

        this._applier.apply(demoPacket, snapshotEvents);
    }

    /**
     * Restarts {@link DemoPacketRaw#ordinal} from zero.
     *
     * @public
     */
    reset() {
        this._ordinal = 0;
    }
}

export default DemoPacketProcessor;

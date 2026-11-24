/** @import DemoPacketRaw from '../../data/DemoPacketRaw.js' */

import Assert from '../../core/Assert.js';

import Writable from '#core/stream/Writable.js';

import StreamConfiguration from '../../configurations/StreamConfiguration.js';

import DemoCutIndex from '../../cut/DemoCutIndex.js';

/**
 * Indexes a stream of {@link DemoPacketRaw} for cutting: records packet types and ticks.
 */
class DemoStreamCutIndexer extends Writable {
    /** @private @type {DemoCutIndex|null} */
    _index = null;

    /** @private @type {Array<number>} */
    _ticks = [ ];

    /** @private @type {Array<number>} */
    _typeIds = [ ];

    /**
     * @public
     * @constructor
     * @param {StreamConfiguration} configuration
     */
    constructor(configuration) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof StreamConfiguration, 'Invalid configuration: expected an instance of StreamConfiguration');
    }

    /**
     * Returns the demo index once the stream has finished.
     *
     * @public
     * @returns {DemoCutIndex}
     */
    getIndex() {
        Assert.isTrue(this._index !== null, 'Unable to get the index: the stream has not finished');

        return this._index;
    }

    /**
     * @protected
     * @returns {Promise<void>}
     */
    async _finalize() {
        this._index = new DemoCutIndex(Uint8Array.from(this._typeIds), Int32Array.from(this._ticks));

        this._ticks = [ ];
        this._typeIds = [ ];
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {Promise<void>}
     */
    async _handle(demoPacketRaw) {
        this._typeIds.push(demoPacketRaw.getTypeId());
        this._ticks.push(demoPacketRaw.tick.value);
    }
}

export default DemoStreamCutIndexer;

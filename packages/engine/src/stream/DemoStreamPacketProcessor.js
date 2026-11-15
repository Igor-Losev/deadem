/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */

import Assert from '../core/Assert.js';
import PauseControl from '../core/PauseControl.js';

import Transform from '#core/stream/Transform.js';

import DemoPacketProcessor from '../processing/DemoPacketProcessor.js';

import ParserConfiguration from '../ParserConfiguration.js';

/**
 * Given a stream of {@link DemoPacketRaw}, processes them sequentially.
 * Parks between packets while paused.
 *
 * Stream wrapper around {@link DemoPacketProcessor}.
 */
class DemoStreamPacketProcessor extends Transform {
    /** @private @type {PauseControl} */
    _pause;

    /** @private @type {DemoPacketProcessor} */
    _processor;

    /**
     * @public
     * @constructor
     * @param {ParserConfiguration} configuration
     * @param {DemoPacketProcessor} processor
     * @param {PauseControl} pause
     */
    constructor(configuration, processor, pause) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof ParserConfiguration, 'Invalid configuration: expected an instance of ParserConfiguration');
        Assert.isTrue(processor instanceof DemoPacketProcessor, 'Invalid processor: expected an instance of DemoPacketProcessor');
        Assert.isTrue(pause instanceof PauseControl, 'Invalid pause: expected an instance of PauseControl');

        this._pause = pause;
        this._processor = processor;
    }

    /**
     * @async
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     */
    async _handle(demoPacketRaw) {
        const pausePromise = this._pause.deferred;

        if (pausePromise !== null) {
            await pausePromise.promise;
        }

        this._processor.process(demoPacketRaw);
    }
}

export default DemoStreamPacketProcessor;

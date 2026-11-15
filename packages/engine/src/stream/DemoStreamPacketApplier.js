/** @import DemoPacket from '../data/DemoPacket.js' */

import Assert from '../core/Assert.js';
import PauseControl from '../core/PauseControl.js';

import Transform from '#core/stream/Transform.js';

import DemoPacketApplier from '../processing/DemoPacketApplier.js';

import ParserConfiguration from '../ParserConfiguration.js';

/**
 * Given a stream of {@link DemoPacket}, applies them sequentially
 * to the {@link Demo} state. Parks between packets while paused.
 *
 * Stream wrapper around {@link DemoPacketApplier}.
 */
class DemoStreamPacketApplier extends Transform {
    /** @private @type {DemoPacketApplier} */
    _applier;

    /** @private @type {PauseControl} */
    _pause;

    /**
     * @public
     * @constructor
     * @param {ParserConfiguration} configuration
     * @param {DemoPacketApplier} applier
     * @param {PauseControl} pause
     */
    constructor(configuration, applier, pause) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof ParserConfiguration, 'Invalid configuration: expected an instance of ParserConfiguration');
        Assert.isTrue(applier instanceof DemoPacketApplier, 'Invalid applier: expected an instance of DemoPacketApplier');
        Assert.isTrue(pause instanceof PauseControl, 'Invalid pause: expected an instance of PauseControl');

        this._applier = applier;
        this._pause = pause;
    }

    /**
     * @async
     * @protected
     * @param {DemoPacket} demoPacket
     */
    async _handle(demoPacket) {
        const pausePromise = this._pause.deferred;

        if (pausePromise !== null) {
            await pausePromise.promise;
        }

        this._applier.apply(demoPacket);
    }
}

export default DemoStreamPacketApplier;

/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */

import Assert from '../core/Assert.js';
import PauseControl from '../core/PauseControl.js';

import Transform from '#core/stream/Transform.js';

import StreamConfiguration from '../configurations/StreamConfiguration.js';

import DemoSession from '../DemoSession.js';

/**
 * Given a stream of {@link DemoPacketRaw}, processes them sequentially.
 * Parks between packets while paused.
 *
 * Stream wrapper around {@link DemoSession}.
 */
class DemoStreamPacketProcessor extends Transform {
    /** @private @type {PauseControl} */
    _pause;

    /** @private @type {DemoSession} */
    _session;

    /**
     * @public
     * @constructor
     * @param {StreamConfiguration} configuration
     * @param {DemoSession} session
     * @param {PauseControl} pause
     */
    constructor(configuration, session, pause) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof StreamConfiguration, 'Invalid configuration: expected an instance of StreamConfiguration');
        Assert.isTrue(session instanceof DemoSession, 'Invalid session: expected an instance of DemoSession');
        Assert.isTrue(pause instanceof PauseControl, 'Invalid pause: expected an instance of PauseControl');

        this._pause = pause;
        this._session = session;
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

        this._session.process(demoPacketRaw);
    }
}

export default DemoStreamPacketProcessor;

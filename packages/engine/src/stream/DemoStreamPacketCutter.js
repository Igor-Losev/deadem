/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */

import Assert from '../core/Assert.js';

import Transform from '#core/stream/Transform.js';

import StreamConfiguration from '../configurations/StreamConfiguration.js';

import DemoFormat from '../data/DemoFormat.js';

import DemoCutAction from '../data/enums/DemoCutAction.js';

/**
 * Cuts packets according to the plan.
 */
class DemoStreamPacketCutter extends Transform {
    /** @private @type {Uint8Array} */
    _actions;

    /** @private @type {{ scanned: number, written: number }} */
    _ticks = { scanned: DemoFormat.INITIAL_TICK, written: DemoFormat.INITIAL_TICK };

    /**
     * @public
     * @constructor
     * @param {StreamConfiguration} configuration
     * @param {Uint8Array} actions - The id of a {@link DemoCutAction} for every packet, by sequence.
     */
    constructor(configuration, actions) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof StreamConfiguration, 'Invalid configuration: expected an instance of StreamConfiguration');
        Assert.isTrue(actions instanceof Uint8Array, 'Invalid actions: expected a Uint8Array');

        this._actions = actions;
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {Promise<void>}
     */
    async _handle(demoPacketRaw) {
        Assert.isTrue(demoPacketRaw.sequence < this._actions.length, `Unable to cut: packet [ ${demoPacketRaw.sequence} ] is beyond the loaded demo`);

        const tick = this._ticks.written + demoPacketRaw.tick.value - this._ticks.scanned;

        this._ticks.scanned = demoPacketRaw.tick.value;

        if (this._actions[demoPacketRaw.sequence] === DemoCutAction.DROP.id) {
            return;
        }

        this._ticks.written = tick;

        this._push(demoPacketRaw.withTick(tick));
    }
}

export default DemoStreamPacketCutter;

/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */

import Assert from '../core/Assert.js';

import Transform from '#core/stream/Transform.js';

import StreamConfiguration from '../configurations/StreamConfiguration.js';

import DemoCutPlan from '../cut/DemoCutPlan.js';

import DemoFormat from '../data/DemoFormat.js';

import DemoCutAction from '../data/enums/DemoCutAction.js';

/**
 * Cuts packets according to the plan.
 */
class DemoStreamPacketCutter extends Transform {
    /** @private @type {DemoCutPlan} */
    _plan;

    /** @private @type {{ scanned: number, written: number }} */
    _ticks = { scanned: DemoFormat.INITIAL_TICK, written: DemoFormat.INITIAL_TICK };

    /**
     * @public
     * @constructor
     * @param {StreamConfiguration} configuration
     * @param {DemoCutPlan} plan
     */
    constructor(configuration, plan) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof StreamConfiguration, 'Invalid configuration: expected an instance of StreamConfiguration');
        Assert.isTrue(plan instanceof DemoCutPlan, 'Invalid plan: expected an instance of DemoCutPlan');

        this._plan = plan;
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {Promise<void>}
     */
    async _handle(demoPacketRaw) {
        const tick = this._ticks.written + demoPacketRaw.tick.value - this._ticks.scanned;

        this._ticks.scanned = demoPacketRaw.tick.value;

        if (this._plan.getAction(demoPacketRaw.sequence) === DemoCutAction.DROP) {
            return;
        }

        this._ticks.written = tick;

        this._push(demoPacketRaw.withTick(tick));
    }
}

export default DemoStreamPacketCutter;

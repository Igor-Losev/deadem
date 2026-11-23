/** @import DemoPacketRaw from '../../data/DemoPacketRaw.js' */

import Assert from '../../core/Assert.js';

import Transform from '#core/stream/Transform.js';

import StreamConfiguration from '../../configurations/StreamConfiguration.js';

import DemoCutPlan from '../../cut/DemoCutPlan.js';

import DemoFormat from '../../data/DemoFormat.js';

import DemoCutAction from '../../data/enums/DemoCutAction.js';

/**
 * Cuts packets according to the plan.
 */
class DemoStreamPacketCutter extends Transform {
    /** @private @type {DemoCutPlan} */
    _plan;

    /** @private @type {{ lastScanned: number, lastWritten: number }} */
    _ticks = { lastScanned: DemoFormat.INITIAL_TICK, lastWritten: DemoFormat.INITIAL_TICK };

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
        const action = this._plan.getAction(demoPacketRaw.sequence);
        const distance = demoPacketRaw.tick.value - this._ticks.lastScanned;

        this._ticks.lastScanned = demoPacketRaw.tick.value;

        if (action === DemoCutAction.DROP) {
            return;
        }

        this._ticks.lastWritten += action === DemoCutAction.SNAPSHOT ? 1 : distance;

        this._push(demoPacketRaw.withTick(this._ticks.lastWritten));
    }
}

export default DemoStreamPacketCutter;

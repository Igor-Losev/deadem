/** @import DemoPacketRaw from '../../data/DemoPacketRaw.js' */

import Assert from '../../core/Assert.js';

import Transform from '#core/stream/Transform.js';

import StreamConfiguration from '../../configurations/StreamConfiguration.js';

import DemoCutPlan from '../../cut/DemoCutPlan.js';

import DemoFormat from '../../data/DemoFormat.js';

import DemoCutAction from '../../data/enums/DemoCutAction.js';

/**
 * Cuts packets according to the plan and moves them onto the ticks of the cut.
 */
class DemoStreamPacketCutter extends Transform {
    /** @private @type {DemoCutPlan} */
    _plan;

    /** @private @type {number} - The tick of the last packet in the source, dropped or not. */
    _sourceTick = DemoFormat.INITIAL_TICK;

    /** @private @type {{ action: DemoCutAction|null, tick: number }} - The last packet in the cut. */
    _written = { action: null, tick: DemoFormat.INITIAL_TICK };

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
     * Returns the tick of the packet in the cut.
     *
     * @private
     * @param {DemoCutAction} action
     * @param {number} step - The distance from the previous packet in the source.
     * @returns {number}
     */
    _getTick(action, step) {
        if (action === DemoCutAction.CATCH_UP && this._written.action === DemoCutAction.CATCH_UP) {
            return this._written.tick;
        }

        if (action === DemoCutAction.CATCH_UP || action === DemoCutAction.SNAPSHOT) {
            return this._written.tick + 1;
        }

        return this._written.tick + step;
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {Promise<void>}
     */
    async _handle(demoPacketRaw) {
        const action = this._plan.getAction(demoPacketRaw.sequence);
        const step = demoPacketRaw.tick.value - this._sourceTick;

        this._sourceTick = demoPacketRaw.tick.value;

        if (action === DemoCutAction.DROP) {
            return;
        }

        this._written.tick = this._getTick(action, step);
        this._written.action = action;

        this._push(demoPacketRaw.withTick(this._written.tick));
    }
}

export default DemoStreamPacketCutter;

import { InterceptorStage, MessagePacketType } from 'deadem';

import StatsAccumulator from './StatsAccumulator.js';
import StatsAccumulatorTiming from './StatsAccumulatorTiming.js';

class Benchmark {
    /**
     * @public
     * @constructor
     */
    constructor() {
        this._memory = new StatsAccumulator();

        this._ticksPerSecond = new StatsAccumulator();

        this._totalParserTiming = new StatsAccumulatorTiming();
        this._totalDPacketTiming = new StatsAccumulatorTiming();
        this._totalMPacketTiming = new StatsAccumulatorTiming();
    }

    /**
     * @public
     * @returns {{demo: {parses: StatsAccumulatorResult, ticksPerSecond: StatsAccumulatorResult}, packets: {message: StatsAccumulatorResult, demo: StatsAccumulatorResult}}}
     */
    getResult() {
        return {
            demo: {
                parses: this._totalParserTiming.getResult(),
                memory: this._memory.getResult(),
                tps: this._ticksPerSecond.getResult()
            },
            packets: {
                demo: this._totalDPacketTiming.getResult(),
                message: this._totalMPacketTiming.getResult()
            }
        };
    }

    /**
     * @public
     * @param {Parser} parser
     * @param {Stream.Readable|ReadableStream} readable
     * @returns {Promise<void>}
     */
    async parse(parser, readable) {
        let lastTick = 0;

        // Packet timings affect the performance / memory usage.
        /*
        parser.registerPreInterceptor(InterceptorStage.DEMO_PACKET, () => {
            this._totalDPacketTiming.start();
        });

        parser.registerPreInterceptor(InterceptorStage.MESSAGE_PACKET, () => {
            this._totalMPacketTiming.start();
        });

        parser.registerPostInterceptor(InterceptorStage.DEMO_PACKET, () => {
            this._totalDPacketTiming.end();
        });

        parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, () => {
            this._totalMPacketTiming.end();
        });
        */

        parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
            if (messagePacket.type === MessagePacketType.NET_TICK) {
                lastTick = messagePacket.data.tick;
            }
        });

        this._totalParserTiming.start();

        await parser.parse(readable);

        const difference = this._totalParserTiming.end();

        if (lastTick === 0 || !Number.isInteger(lastTick)) {
            throw new Error(`Last tick must be a positive integer [ ${lastTick} ]`);
        }

        const stats = parser.getStats();

        if (stats.memory.maxMemoryUsage) {
            this._memory.push(stats.memory.maxMemoryUsage / (1024 * 1024));
        }

        this._ticksPerSecond.push(lastTick / (difference / 1000));

        this._memory.calculate();
        this._ticksPerSecond.calculate();
        this._totalParserTiming.calculate();
        this._totalMPacketTiming.calculate();
        this._totalDPacketTiming.calculate();
    }
}

export default Benchmark;

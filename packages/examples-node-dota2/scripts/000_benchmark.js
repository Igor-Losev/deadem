import { Logger, MessagePacketType, Parser, ParserConfiguration } from '@deademx/dota2';

import Benchmark from '@deademx/examples-common/data/Benchmark.js';
import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';
import StatsAccumulator from '@deademx/examples-common/data/StatsAccumulator.js';

const DEFAULT_REPEATS = 10;
const REPEATS_ARGUMENT_PREFIX = '--repeats=';
const RUNTIME = `Node.js ${process.version}`;

const repeatsArgument = process.argv.find((arg) => arg.startsWith(REPEATS_ARGUMENT_PREFIX));
const repeats = repeatsArgument ? Number.parseInt(repeatsArgument.slice(REPEATS_ARGUMENT_PREFIX.length), 10) : DEFAULT_REPEATS;

if (!Number.isInteger(repeats) || repeats <= 0) {
    throw new Error('Argument --repeats must be a positive integer');
}

const CONFIG = {
    DEMO: DemoFile.DOTA2_REPLAY_8783006717,
    REPEATS: repeats,
    TICK_RATE: 30
};

const CASES = [
    {
        id: 1,
        label: 'All packet types (entities included)',
        configuration: ParserConfiguration.DEFAULT
    },
    {
        id: 2,
        label: 'All packet types, SVC_PACKET_ENTITIES excluded',
        configuration: new ParserConfiguration({ messagePacketTypesExclude: [ MessagePacketType.SVC_PACKET_ENTITIES ] })
    },
    {
        id: 3,
        label: 'Single MessagePacketType only',
        configuration: new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.DOTA_UM_CHAT_MESSAGE ] })
    }
];

(async () => {
    if (typeof global.gc !== 'function') {
        throw new Error('Run node with --expose-gc');
    }

    const logger = Logger.CONSOLE_INFO;
    const rows = [];

    for (const benchmarkCase of CASES) {
        logger.info(`Running benchmark case [ ${benchmarkCase.id} ]: ${benchmarkCase.label}`);

        const result = await runBenchmarkCase(benchmarkCase);

        rows.push({
            id: benchmarkCase.id,
            label: benchmarkCase.label,
            ...result
        });

        logger.info(`Finished benchmark case [ ${benchmarkCase.id} ]`);
        logger.info(`Runtime: ${result.runtime}`);
        logger.info(`Ticks/sec: ${formatMeasured(result.tps.mean, result.tps.std, 0)}`);
        logger.info(`Game seconds/sec: ${formatMeasured(result.gps.mean, result.gps.std, 2)}`);
        logger.info(`30-min replay, sec: ${result.replay30Formatted}`);
        logger.info(`Max memory, MB: ${formatMeasured(result.memory.mean, result.memory.std, 0)}`);
        logger.info(`Memory breakdown, MB: heap=${formatMeasured(result.memoryHeap.mean, result.memoryHeap.std, 0)}, external=${formatMeasured(result.memoryExternal.mean, result.memoryExternal.std, 0)}, arrayBuffers=${formatMeasured(result.memoryArrayBuffers.mean, result.memoryArrayBuffers.std, 0)}, rss=${formatMeasured(result.memoryRss.mean, result.memoryRss.std, 0)}`);
    }
})();

/**
 * @param {{id: number, label: string, configuration: ParserConfiguration}} benchmarkCase
 * @returns {Promise<{gps: StatsAccumulatorResult, memory: StatsAccumulatorResult, memoryArrayBuffers: StatsAccumulatorResult, memoryExternal: StatsAccumulatorResult, memoryHeap: StatsAccumulatorResult, memoryRss: StatsAccumulatorResult, replay30Formatted: string, runtime: string, tps: StatsAccumulatorResult}>}
 */
async function runBenchmarkCase(benchmarkCase) {
    const benchmark = new Benchmark();
    const memoryHeap = new StatsAccumulator();
    const memoryExternal = new StatsAccumulator();
    const memoryArrayBuffers = new StatsAccumulator();
    const memoryRss = new StatsAccumulator();

    for (let counter = 0; counter < CONFIG.REPEATS; counter++) {
        const readable = await DemoProvider.read(CONFIG.DEMO);
        const parser = new Parser(benchmarkCase.configuration, Logger.CONSOLE_WARN);

        await benchmark.parse(parser, readable);

        const stats = parser.getStats();

        pushMegabytes(memoryHeap, stats.memory.maxHeapUsed);
        pushMegabytes(memoryExternal, stats.memory.maxExternalUsage);
        pushMegabytes(memoryArrayBuffers, stats.memory.maxArrayBufferUsage);
        pushMegabytes(memoryRss, stats.memory.maxResidentSetSize);

        await parser.dispose();

        await pause(50);

        global.gc();
    }

    memoryHeap.calculate();
    memoryExternal.calculate();
    memoryArrayBuffers.calculate();
    memoryRss.calculate();

    const result = benchmark.getResult();
    const gps = scaleStatsResult(result.demo.tps, 1 / CONFIG.TICK_RATE);

    return {
        gps,
        memory: result.demo.memory,
        memoryArrayBuffers: memoryArrayBuffers.getResult(),
        memoryExternal: memoryExternal.getResult(),
        memoryHeap: memoryHeap.getResult(),
        memoryRss: memoryRss.getResult(),
        replay30Formatted: formatReplayDuration(gps.mean),
        runtime: RUNTIME,
        tps: result.demo.tps
    };
}

/**
 * @param {StatsAccumulator} accumulator
 * @param {number|null} bytes
 */
function pushMegabytes(accumulator, bytes) {
    if (bytes !== null) {
        accumulator.push(bytes / (1024 * 1024));
    }
}

/**
 * @param {number} mean
 * @param {number} std
 * @param {number} decimals
 * @returns {string}
 */
function formatMeasured(mean, std, decimals = 0) {
    const value = formatNumber(mean, decimals);
    const relativeStd = mean === 0 ? 0 : (std / mean) * 100;

    return `${value} +- ${relativeStd.toFixed(2)}%`;
}

/**
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
function formatNumber(value, decimals = 0) {
    return value.toLocaleString('ru-RU', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals
    });
}

/**
 * @param {StatsAccumulatorResult} stats
 * @param {number} factor
 * @returns {StatsAccumulatorResult}
 */
function scaleStatsResult(stats, factor) {
    return {
        count: stats.count,
        max: stats.max === null ? null : stats.max * factor,
        mean: stats.mean * factor,
        min: stats.min === null ? null : stats.min * factor,
        std: stats.std * factor
    };
}

/**
 * @param {number} gameSecondsPerSecond
 * @returns {string}
 */
function formatReplayDuration(gameSecondsPerSecond) {
    const replaySeconds = 30 * 60 / gameSecondsPerSecond;

    return `~${replaySeconds.toFixed(2)}`;
}

function pause(ms = 50) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

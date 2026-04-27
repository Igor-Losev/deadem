import { Logger } from '@deademx/engine';

import Benchmark from './Benchmark.js';
import DemoProvider from './DemoProvider.js';
import StatsAccumulator from './StatsAccumulator.js';

const DEFAULT_REPEATS = 10;
const REPEATS_ARGUMENT_PREFIX = '--repeats=';

/**
 * Runs a parser benchmark suite over a list of {@link ParserConfiguration} cases,
 * prints per-case stats, and emits a Markdown table at the end.
 *
 * Requires the host process to be started with `--expose-gc`.
 *
 * @public
 * @param {object} options
 * @param {Function} options.Parser - Parser constructor (`(configuration, logger) => Parser`).
 * @param {DemoFile} options.demoFile
 * @param {number} options.tickRate
 * @param {Array<{id: number, label: string, configuration: ParserConfiguration}>} options.cases
 * @param {number} [options.repeats] - Overrides `--repeats=` CLI flag and the default of 10.
 * @returns {Promise<void>}
 */
async function runBenchmarks(options) {
    const { Parser, demoFile, tickRate, cases } = options;
    const repeats = options.repeats ?? readRepeatsFromArgv();

    if (typeof global.gc !== 'function') {
        throw new Error('Run node with --expose-gc');
    }

    const logger = Logger.CONSOLE_INFO;
    const rows = [];

    logger.info(`Repeats per case: [ ${repeats} ]`);

    for (const benchmarkCase of cases) {
        logger.info(`Running benchmark case [ ${benchmarkCase.id} ]: ${benchmarkCase.label}`);

        const result = await runBenchmarkCase(Parser, demoFile, tickRate, benchmarkCase, repeats);

        rows.push({ id: benchmarkCase.id, label: benchmarkCase.label, ...result });

        logger.info(`Finished benchmark case [ ${benchmarkCase.id} ]`);
        logger.info(`Runtime: ${result.runtime}`);
        logger.info(`Ticks/sec: ${formatMeasured(result.tps, 0)}`);
        logger.info(`Game seconds/sec: ${formatMeasured(result.gps, 2)}`);
        logger.info(`30-min replay, sec: ${result.replay30Formatted}`);
        logger.info(`Max memory, MB: ${formatMeasured(result.memory, 0)}`);
        logger.info(`Memory breakdown, MB: heap=${formatMeasured(result.memoryHeap, 0)}, external=${formatMeasured(result.memoryExternal, 0)}, arrayBuffers=${formatMeasured(result.memoryArrayBuffers, 0)}, rss=${formatMeasured(result.memoryRss, 0)}`);
    }

    console.log('');
    console.log('Markdown table rows:');

    for (const row of rows) {
        console.log(`| ${row.id} | ${row.label} | ${row.runtime} | ${formatMeasured(row.tps, 0)} | ${formatMeasured(row.gps, 2)} | ${row.replay30Formatted} | ${formatMeasured(row.memory, 0)} |`);
    }
}

/**
 * @param {Function} Parser
 * @param {DemoFile} demoFile
 * @param {number} tickRate
 * @param {{configuration: ParserConfiguration}} benchmarkCase
 * @param {number} repeats
 * @returns {Promise<BenchmarkCaseResult>}
 */
async function runBenchmarkCase(Parser, demoFile, tickRate, benchmarkCase, repeats) {
    const benchmark = new Benchmark();
    const memoryHeap = new StatsAccumulator();
    const memoryExternal = new StatsAccumulator();
    const memoryArrayBuffers = new StatsAccumulator();
    const memoryRss = new StatsAccumulator();

    for (let counter = 0; counter < repeats; counter++) {
        const readable = await DemoProvider.read(demoFile);
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
    const gps = scaleStatsResult(result.demo.tps, 1 / tickRate);

    return {
        gps,
        memory: result.demo.memory,
        memoryArrayBuffers: memoryArrayBuffers.getResult(),
        memoryExternal: memoryExternal.getResult(),
        memoryHeap: memoryHeap.getResult(),
        memoryRss: memoryRss.getResult(),
        replay30Formatted: formatReplayDuration(gps.mean),
        runtime: `Node.js ${process.version}`,
        tps: result.demo.tps
    };
}

/**
 * @returns {number}
 */
function readRepeatsFromArgv() {
    const argument = process.argv.find(value => value.startsWith(REPEATS_ARGUMENT_PREFIX));
    const repeats = argument
        ? Number.parseInt(argument.slice(REPEATS_ARGUMENT_PREFIX.length), 10)
        : DEFAULT_REPEATS;

    if (!Number.isInteger(repeats) || repeats <= 0) {
        throw new Error('Argument --repeats must be a positive integer');
    }

    return repeats;
}

/**
 * @param {StatsAccumulator} accumulator
 * @param {number|null} bytes
 */
function pushMegabytes(accumulator, bytes) {
    if (bytes === null) {
        return;
    }

    accumulator.push(bytes / (1024 * 1024));
}

/**
 * @param {StatsAccumulatorResult} stats
 * @param {number} decimals
 * @returns {string}
 */
function formatMeasured(stats, decimals = 0) {
    const value = stats.mean.toLocaleString('ru-RU', {
        maximumFractionDigits: decimals,
        minimumFractionDigits: decimals
    });
    const relativeStd = stats.mean === 0 ? 0 : (stats.std / stats.mean) * 100;

    return `${value} +- ${relativeStd.toFixed(2)}%`;
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

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @typedef {{
 *   gps: StatsAccumulatorResult,
 *   memory: StatsAccumulatorResult,
 *   memoryArrayBuffers: StatsAccumulatorResult,
 *   memoryExternal: StatsAccumulatorResult,
 *   memoryHeap: StatsAccumulatorResult,
 *   memoryRss: StatsAccumulatorResult,
 *   replay30Formatted: string,
 *   runtime: string,
 *   tps: StatsAccumulatorResult
 * }} BenchmarkCaseResult
 */

export default runBenchmarks;

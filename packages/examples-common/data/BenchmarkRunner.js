import { fork } from 'node:child_process';

import { Logger } from '@deademx/engine';

import Benchmark from './Benchmark.js';
import DemoProvider from './DemoProvider.js';
import StatsAccumulator from './StatsAccumulator.js';

const CASE_ID = '--bench-case-id=';

/**
 * @public
 * @param {object} options
 * @param {Function} options.Parser
 * @param {DemoFile} options.demoFile
 * @param {number} options.tickRate
 * @param {Array<{id: number, label: string, configuration: ParserConfiguration}>} options.cases
 * @param {number} options.repeats
 * @returns {Promise<void>}
 */
async function runBenchmarks(options) {
    return typeof process.send === 'function' ? runChild(options) : runParent(options);
}

async function runParent({ cases, repeats }) {
    const logger = Logger.CONSOLE_INFO;
    const rows = [];

    logger.info(`Repeats per case: [ ${repeats} ] (isolated)`);

    for (const c of cases) {
        logger.info(`Case [ ${c.id} ]: ${c.label}`);

        const r = await runIsolatedCase(process.argv[1], c.id);

        rows.push({ id: c.id, label: c.label, ...r });

        logger.info(`  ticks/sec=${fmt(r.tps)}, 30-min=${r.replay30Formatted}s, rss=${fmt(r.memoryRss)} MB`);
    }

    console.log('\nMarkdown rows:');

    for (const r of rows) {
        console.log(`| ${r.id} | ${r.label} | ${r.runtime} | ${fmt(r.tps)} | ${fmt(r.gps, 2)} | ${r.replay30Formatted} | ${fmt(r.memoryRss)} |`);
    }
}

async function runChild({ Parser, demoFile, tickRate, cases, repeats }) {
    if (typeof global.gc !== 'function') {
        throw new Error('Run node with --expose-gc');
    }

    if (cases.length !== 1) {
        throw new Error(`Child expects one case, received ${cases.length}`);
    }

    process.send({ type: 'result', payload: await runBenchmarkCase(Parser, demoFile, tickRate, cases[0], repeats) });
}

function runIsolatedCase(scriptPath, caseId) {
    return new Promise((resolve, reject) => {
        const argv = process.argv.slice(2).filter(a => !a.startsWith(CASE_ID));

        const child = fork(scriptPath, [ `${CASE_ID}${caseId}`, ...argv ], {
            execArgv: [ '--expose-gc' ],
            stdio: [ 'inherit', 'inherit', 'inherit', 'ipc' ]
        });

        let payload = null;

        child.on('message', m => { if (m?.type === 'result') payload = m.payload; });
        child.on('error', reject);
        child.on('exit', (code, signal) => {
            if (signal !== null) reject(new Error(`Case [ ${caseId} ] killed by ${signal}`));
            else if (code !== 0) reject(new Error(`Case [ ${caseId} ] exited with code ${code}`));
            else if (payload === null) reject(new Error(`Case [ ${caseId} ] sent no result`));
            else resolve(payload);
        });
    });
}

async function runBenchmarkCase(Parser, demoFile, tickRate, benchmarkCase, repeats) {
    const benchmark = new Benchmark();
    const heap = new StatsAccumulator();
    const external = new StatsAccumulator();
    const arrayBuffers = new StatsAccumulator();
    const rss = new StatsAccumulator();

    for (let i = 0; i < repeats; i++) {
        const readable = await DemoProvider.read(demoFile);
        const parser = new Parser(benchmarkCase.configuration, Logger.CONSOLE_WARN);

        await benchmark.parse(parser, readable);

        const m = parser.getStats().memory;

        push(heap, m.maxHeapUsed);
        push(external, m.maxExternalUsage);
        push(arrayBuffers, m.maxArrayBufferUsage);
        push(rss, m.maxResidentSetSize);

        await parser.dispose();
        await new Promise(r => setTimeout(r, 50));

        global.gc();
    }

    [ heap, external, arrayBuffers, rss ].forEach(s => s.calculate());

    const result = benchmark.getResult();
    const tps = result.demo.tps;
    const gps = {
        count: tps.count,
        max: tps.max === null ? null : tps.max / tickRate,
        mean: tps.mean / tickRate,
        min: tps.min === null ? null : tps.min / tickRate,
        std: tps.std / tickRate
    };

    return {
        gps,
        memory: result.demo.memory,
        memoryArrayBuffers: arrayBuffers.getResult(),
        memoryExternal: external.getResult(),
        memoryHeap: heap.getResult(),
        memoryRss: rss.getResult(),
        replay30Formatted: `~${(30 * 60 / gps.mean).toFixed(2)}`,
        runtime: `Node.js ${process.version}`,
        tps
    };
}

function push(accumulator, bytes) {
    if (bytes !== null) accumulator.push(bytes / (1024 * 1024));
}

function fmt(stats, decimals = 0) {
    const v = stats.mean.toLocaleString('ru-RU', { maximumFractionDigits: decimals, minimumFractionDigits: decimals });
    const std = stats.mean === 0 ? 0 : (stats.std / stats.mean) * 100;

    return `${v} +- ${std.toFixed(2)}%`;
}

export default runBenchmarks;

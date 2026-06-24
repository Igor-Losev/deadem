import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import inspector from 'node:inspector';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ParserConfiguration } from '@deademx/engine';

import FileSystem from '@deademx/engine/src/core/FileSystem.js';

import DemoProvider from './DemoProvider.js';

const REPO_ROOT = FileSystem.getAbsolutePath(import.meta.url, './../../..');
const PACKAGES_ROOT = path.join(REPO_ROOT, 'packages');

const MB = 1024 * 1024;
const TOP = 20;
const SAMPLE_MS = 50;
const SAMPLING_INTERVAL = 65536;
const MAX_OLD_SPACE_MB = 1536;
const CHILD_FLAG = 'DEADEM_PROFILE_CHILD';
const CHILD_PASS_GC = 'gc';
const CHILD_PASS_ALLOC = 'alloc';

const PROFILE_PIPE_FD = 3;
const SUMMARY_PREFIX = '__DEADEM_PROFILE_SUMMARY__';
const ALLOCATION_PROFILE_PREFIX = '__DEADEM_ALLOCATION_PROFILE__';

const PARSER_CONFIGURATION = ParserConfiguration.DEFAULT;

/**
 * Two sequential passes:
 *   1. GC pass     — --trace-gc-nvp + memory sampler, no inspector.
 *                    Elapsed / GC pause / allocated bytes numbers.
 *   2. Alloc pass  — Inspector heap sampler. Top allocators.
 *
 * @public
 * @param {object} options
 * @param {Function} options.Parser
 * @param {DemoFile} options.demoFile
 * @returns {Promise<void>}
 */
async function runProfile({ Parser, demoFile }) {
    const childMode = process.env[CHILD_FLAG];

    if (childMode === CHILD_PASS_GC) {
        await runChildGc({ Parser, demoFile });
    } else if (childMode === CHILD_PASS_ALLOC) {
        await runChildAlloc({ Parser, demoFile });
    } else {
        runParent(process.argv[1]);
    }
}

/**
 * @param {{Parser: Function, demoFile: DemoFile}} options
 */
async function runChildGc({ Parser, demoFile }) {
    if (global.gc) {
        global.gc();
    }

    const reader = await DemoProvider.read(demoFile);
    const parser = new Parser(PARSER_CONFIGURATION);
    const sampler = createMemorySampler();
    const startedAt = Date.now();

    let summary;

    try {
        await parser.parse(reader);

        const elapsedMs = Date.now() - startedAt;
        const peak = sampler.stop();
        const entities = parser.getDemo().getEntities();
        const packets = countPackets(parser.getStats().packet.parsed);

        let totalStateSize = 0;

        for (const entity of entities) {
            totalStateSize += entity.getFieldCount();
        }

        summary = {
            demo: demoFile.getFileName(),
            elapsedMs,
            entities: entities.length,
            totalStateSize,
            demoPackets: packets.demo,
            messagePackets: packets.message,
            peak
        };
    } finally {
        sampler.stop();
        await parser.dispose();
    }

    writeProfileMessage(SUMMARY_PREFIX, summary);
}

/**
 * @param {{Parser: Function, demoFile: DemoFile}} options
 */
async function runChildAlloc({ Parser, demoFile }) {
    if (global.gc) {
        global.gc();
    }

    const session = new inspector.Session();

    session.connect();

    await post(session, 'HeapProfiler.enable');
    await post(session, 'HeapProfiler.startSampling', {
        samplingInterval: SAMPLING_INTERVAL,
        includeObjectsCollectedByMajorGC: true,
        includeObjectsCollectedByMinorGC: true
    });

    const reader = await DemoProvider.read(demoFile);
    const parser = new Parser(PARSER_CONFIGURATION);

    try {
        await parser.parse(reader);
    } finally {
        await parser.dispose();
    }

    const result = await post(session, 'HeapProfiler.stopSampling');

    session.disconnect();

    writeProfileMessage(ALLOCATION_PROFILE_PREFIX, result.profile);
}

/**
 * @param {string} scriptPath
 */
function runParent(scriptPath) {
    console.log('[1/2] GC pass (--trace-gc-nvp, no inspector)');

    const gcPass = spawnPass(scriptPath, CHILD_PASS_GC, [
        `--max-old-space-size=${MAX_OLD_SPACE_MB}`,
        '--expose-gc',
        '--trace-gc',
        '--trace-gc-nvp',
        scriptPath
    ]);

    if (gcPass.summary === null) {
        throw new Error('GC pass did not return a parse summary');
    }

    console.log('[2/2] Allocation pass (inspector heap sampling)');

    const allocPass = spawnPass(scriptPath, CHILD_PASS_ALLOC, [
        `--max-old-space-size=${MAX_OLD_SPACE_MB}`,
        '--expose-gc',
        scriptPath
    ]);

    if (allocPass.allocProfile === null) {
        throw new Error('Allocation pass did not return an allocation profile');
    }

    printParseSummary(gcPass.summary);
    printGcSummary(summarizeGcLog(gcPass.log), gcPass.summary);
    printAllocationSummary(allocPass.allocProfile);
}

/**
 * @param {string} scriptPath
 * @param {string} passType
 * @param {Array<string>} args
 * @returns {{summary: parseSummary|null, allocProfile: Object|null, log: string}}
 */
function spawnPass(scriptPath, passType, args) {
    const result = spawnSync(process.execPath, args, {
        cwd: process.cwd(),
        encoding: 'utf8',
        maxBuffer: 512 * MB,
        env: { ...process.env, [CHILD_FLAG]: passType },
        stdio: [ 'ignore', 'pipe', 'pipe', 'pipe' ]
    });

    const log = `${result.stdout || ''}${result.stderr || ''}`;
    const extracted = extractChildProfile(result.output[PROFILE_PIPE_FD] || '');

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        console.error(log.slice(-8000));
        process.exitCode = result.status || 1;
        throw new Error(`Profile child (${passType}) exited with status ${result.status}`);
    }

    return {
        summary: extracted.summary,
        allocProfile: extracted.allocProfile,
        log
    };
}

/**
 * @param {string} output
 * @returns {{summary: parseSummary|null, allocProfile: Object|null}}
 */
function extractChildProfile(output) {
    const lines = output.split('\n');
    let summary = null;
    let allocProfile = null;

    for (const line of lines) {
        if (line.startsWith(SUMMARY_PREFIX)) {
            summary = JSON.parse(line.slice(SUMMARY_PREFIX.length));
        } else if (line.startsWith(ALLOCATION_PROFILE_PREFIX)) {
            allocProfile = JSON.parse(line.slice(ALLOCATION_PROFILE_PREFIX.length));
        }
    }

    return {
        summary,
        allocProfile
    };
}

/**
 * @param {string} prefix
 * @param {Object} payload
 */
function writeProfileMessage(prefix, payload) {
    const buffer = Buffer.from(`${prefix}${JSON.stringify(payload)}\n`);
    let offset = 0;

    while (offset < buffer.length) {
        offset += fs.writeSync(PROFILE_PIPE_FD, buffer, offset, buffer.length - offset);
    }
}

/**
 * @param {Array<{count: number, children: Array<{count: number}>}>} parsed
 * @returns {{demo: number, message: number}}
 */
function countPackets(parsed) {
    let demo = 0;
    let message = 0;

    for (const item of parsed) {
        demo += item.count;

        for (const child of item.children) {
            message += child.count;
        }
    }

    return { demo, message };
}

function createMemorySampler() {
    const peak = {
        rss: 0,
        heapUsed: 0,
        external: 0,
        arrayBuffers: 0
    };

    const sample = () => {
        const mem = process.memoryUsage();

        peak.rss = Math.max(peak.rss, mem.rss);
        peak.heapUsed = Math.max(peak.heapUsed, mem.heapUsed);
        peak.external = Math.max(peak.external, mem.external);
        peak.arrayBuffers = Math.max(peak.arrayBuffers, mem.arrayBuffers);
    };

    sample();

    const interval = setInterval(sample, SAMPLE_MS);

    return {
        stop() {
            sample();
            clearInterval(interval);

            return peak;
        }
    };
}

/**
 * @param {inspector.Session} session
 * @param {string} method
 * @param {Object} [params]
 * @returns {Promise<Object>}
 */
function post(session, method, params = {}) {
    return new Promise((resolve, reject) => {
        session.post(method, params, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * @param {string} log
 * @returns {gcSummary}
 */
function summarizeGcLog(log) {
    const stats = new Map();
    let totalPauseMs = 0;
    let totalAllocated = 0;
    let totalPromoted = 0;
    let maxBefore = 0;
    let maxAfter = 0;

    for (const line of log.split('\n')) {
        const match = line.match(/\bgc=([a-z]+)/);

        if (!match) {
            continue;
        }

        const type = getGcType(match[1]);
        const pauseMs = readGcNumber(line, 'pause');
        const allocated = readGcNumber(line, 'allocated');
        const promoted = readGcNumber(line, 'promoted');
        const before = readGcNumber(line, 'total_size_before');
        const after = readGcNumber(line, 'total_size_after');
        const stat = stats.get(type) || {
            type,
            count: 0,
            pauseMs: 0,
            allocated: 0,
            promoted: 0
        };

        stat.count++;
        stat.pauseMs += pauseMs;
        stat.allocated += allocated;
        stat.promoted += promoted;
        stats.set(type, stat);

        totalPauseMs += pauseMs;
        totalAllocated += allocated;
        totalPromoted += promoted;
        maxBefore = Math.max(maxBefore, before);
        maxAfter = Math.max(maxAfter, after);
    }

    return {
        stats: Array.from(stats.values()),
        totalPauseMs,
        totalAllocated,
        totalPromoted,
        maxBefore,
        maxAfter
    };
}

/**
 * @param {string} rawType
 * @returns {string}
 */
function getGcType(rawType) {
    if (rawType === 's') {
        return 'scavenge';
    }

    if (rawType === 'mc') {
        return 'mark-compact';
    }

    return rawType;
}

/**
 * @param {string} line
 * @param {string} key
 * @returns {number}
 */
function readGcNumber(line, key) {
    const match = line.match(new RegExp(`\\b${key}=([0-9.]+)`));

    return match ? Number(match[1]) : 0;
}

/**
 * @param {Object} profile
 */
function printAllocationSummary(profile) {
    const rows = [];

    walkAllocationProfile(profile.head, rows);

    const totalBytes = rows.reduce((sum, row) => sum + row.bytes, 0);

    console.log('\nAllocation summary');
    console.table([ {
        rows: rows.length,
        totalSampledAllocatedMB: mb(totalBytes),
        samples: profile.samples?.length || 0
    } ]);

    printAllocationTable('Top allocation leaf frames', aggregate(rows, row => frameKey(row.frame)), entry => ({
        fn: entry.row.frame.fn,
        loc: loc(entry.row.frame),
        owner: entry.row.owner ? `${entry.row.owner.fn} ${loc(entry.row.owner)}` : '-'
    }), totalBytes);
    printAllocationTable('Top project owners', aggregate(rows, row => row.owner ? frameKey(row.owner) : '(no project frame)'), entry => ({
        owner: entry.row.owner ? `${entry.row.owner.fn} ${loc(entry.row.owner)}` : '(no project frame)'
    }), totalBytes);
    printAllocationTable('Top allocation function names', aggregate(rows, row => row.frame.fn), entry => ({
        name: entry.row.frame.fn
    }), totalBytes);
}

/**
 * @param {Object} node
 * @param {Array<allocationRow>} rows
 * @param {Array<frame>} [stack]
 */
function walkAllocationProfile(node, rows, stack = []) {
    const callFrame = node.callFrame;
    const frame = {
        fn: callFrame.functionName || '(anonymous)',
        url: callFrame.url || '',
        line: (callFrame.lineNumber ?? -1) + 1,
        col: (callFrame.columnNumber ?? -1) + 1
    };
    const nextStack = stack.concat(frame);

    if (node.selfSize > 0) {
        rows.push({
            bytes: node.selfSize,
            frame,
            owner: findProjectFrame(nextStack)
        });
    }

    for (const child of node.children || []) {
        walkAllocationProfile(child, rows, nextStack);
    }
}

/**
 * @param {Array<frame>} stack
 * @returns {frame|null}
 */
function findProjectFrame(stack) {
    for (let i = stack.length - 1; i >= 0; i--) {
        const url = normalizedUrl(stack[i].url);

        if (url.startsWith(PACKAGES_ROOT) && !url.includes(`${path.sep}node_modules${path.sep}`)) {
            return stack[i];
        }
    }

    return null;
}

/**
 * @param {Array<allocationRow>} rows
 * @param {Function} keyFn
 * @returns {Array<allocationEntry>}
 */
function aggregate(rows, keyFn) {
    const map = new Map();

    for (const row of rows) {
        const key = keyFn(row);
        let entry = map.get(key);

        if (!entry) {
            entry = {
                bytes: 0,
                nodes: 0,
                row
            };
            map.set(key, entry);
        }

        entry.bytes += row.bytes;
        entry.nodes++;
    }

    return Array.from(map.values()).sort((a, b) => b.bytes - a.bytes);
}

/**
 * @param {string} title
 * @param {Array<allocationEntry>} entries
 * @param {Function} format
 * @param {number} totalBytes
 */
function printAllocationTable(title, entries, format, totalBytes) {
    console.log(`\n${title}`);
    console.table(entries.slice(0, TOP).map(entry => ({
        MB: mb(entry.bytes),
        pct: pct(entry.bytes, totalBytes),
        nodes: entry.nodes,
        ...format(entry)
    })));
}

/**
 * @param {frame} frame
 * @returns {string}
 */
function frameKey(frame) {
    return `${frame.fn}\t${frame.url}\t${frame.line}`;
}

/**
 * @param {frame} frame
 * @returns {string}
 */
function loc(frame) {
    const url = normalizedUrl(frame.url);

    if (!url) {
        return '(no url)';
    }

    if (url.startsWith(REPO_ROOT)) {
        return `${path.relative(REPO_ROOT, url)}:${frame.line}`;
    }

    return `${url}:${frame.line}`;
}

/**
 * @param {string} url
 * @returns {string}
 */
function normalizedUrl(url) {
    if (!url) {
        return '';
    }

    if (url.startsWith('file://')) {
        return fileURLToPath(url);
    }

    return url;
}

/**
 * @param {parseSummary} summary
 */
function printParseSummary(summary) {
    const elapsedSec = summary.elapsedMs / 1000;

    console.log('\nParse summary');
    console.table([ {
        demo: summary.demo,
        elapsedMs: summary.elapsedMs,
        entities: summary.entities,
        totalStateSize: summary.totalStateSize,
        demoPackets: summary.demoPackets,
        messagePackets: summary.messagePackets,
        msgsPerSec: perSecond(summary.messagePackets, elapsedSec),
        peakRssMB: mb(summary.peak.rss),
        peakHeapMB: mb(summary.peak.heapUsed),
        peakExternalMB: mb(summary.peak.external),
        peakArrayBuffersMB: mb(summary.peak.arrayBuffers)
    } ]);
}

/**
 * @param {gcSummary} summary
 * @param {parseSummary} parseSummary
 */
function printGcSummary(summary, parseSummary) {
    const seconds = parseSummary.elapsedMs / 1000;
    const peakHeapBytes = parseSummary.peak.heapUsed;

    console.log('\nGC summary');
    console.table(summary.stats.map(stat => ({
        type: stat.type,
        count: stat.count,
        avgPauseMs: avg(stat.pauseMs, stat.count),
        pauseMs: round1(stat.pauseMs),
        allocatedMB: mb(stat.allocated),
        promotedMB: mb(stat.promoted)
    })));
    console.table([ {
        totalPauseMs: round1(summary.totalPauseMs),
        gcPausePct: pct(summary.totalPauseMs, parseSummary.elapsedMs),
        totalAllocatedMB: mb(summary.totalAllocated),
        allocatedMBs: rate(summary.totalAllocated, seconds),
        allocPerMessageKB: kb(divide(summary.totalAllocated, parseSummary.messagePackets)),
        allocAmplification: round1(divide(summary.totalAllocated, peakHeapBytes)),
        totalPromotedMB: mb(summary.totalPromoted),
        promotionPct: pct(summary.totalPromoted, summary.totalAllocated),
        maxBeforeMB: mb(summary.maxBefore),
        maxAfterMB: mb(summary.maxAfter)
    } ]);
}

/**
 * @param {number} bytes
 * @returns {number}
 */
function mb(bytes) {
    return Number((bytes / MB).toFixed(1));
}

/**
 * @param {number} bytes
 * @returns {number}
 */
function kb(bytes) {
    return Number((bytes / 1024).toFixed(2));
}

/**
 * @param {number} value
 * @returns {number}
 */
function round1(value) {
    return Number(value.toFixed(1));
}

/**
 * @param {number} bytes
 * @param {number} seconds
 * @returns {number}
 */
function rate(bytes, seconds) {
    return seconds === 0 ? 0 : Number((bytes / MB / seconds).toFixed(1));
}

/**
 * @param {number} count
 * @param {number} seconds
 * @returns {number}
 */
function perSecond(count, seconds) {
    return seconds === 0 ? 0 : Math.round(count / seconds);
}

/**
 * @param {number} part
 * @param {number} total
 * @returns {number}
 */
function pct(part, total) {
    return total === 0 ? 0 : Number((part * 100 / total).toFixed(1));
}

/**
 * @param {number} sum
 * @param {number} count
 * @returns {number}
 */
function avg(sum, count) {
    return count === 0 ? 0 : Number((sum / count).toFixed(2));
}

/**
 * @param {number} numerator
 * @param {number} denominator
 * @returns {number}
 */
function divide(numerator, denominator) {
    return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * @typedef {{
 *   demo: string,
 *   elapsedMs: number,
 *   entities: number,
 *   totalStateSize: number,
 *   demoPackets: number,
 *   messagePackets: number,
 *   peak: { rss: number, heapUsed: number, external: number, arrayBuffers: number }
 * }} parseSummary
 *
 * @typedef {{
 *   stats: Array<{ type: string, count: number, pauseMs: number, allocated: number, promoted: number }>,
 *   totalPauseMs: number,
 *   totalAllocated: number,
 *   totalPromoted: number,
 *   maxBefore: number,
 *   maxAfter: number
 * }} gcSummary
 *
 * @typedef {{ fn: string, url: string, line: number, col: number }} frame
 * @typedef {{ bytes: number, frame: frame, owner: frame|null }} allocationRow
 * @typedef {{ bytes: number, nodes: number, row: allocationRow }} allocationEntry
 */

export default runProfile;

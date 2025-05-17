'use strict';

const assert = require('node:assert/strict'),
    Stream = require('node:stream');

const Demo = require('./data/Demo');

const PerformanceTrackerCategory = require('./data/enums/PerformanceTrackerCategory');

const DemoStreamBufferSplitter = require('./stream/DemoStreamBufferSplitter'),
    DemoStreamPacketAnalyzer = require('./stream/DemoStreamPacketAnalyzer'),
    DemoStreamPacketBatcher = require('./stream/DemoStreamPacketBatcher'),
    DemoStreamPacketCoordinator = require('./stream/DemoStreamPacketCoordinator'),
    DemoStreamPacketExtractor = require('./stream/DemoStreamPacketExtractor'),
    DemoStreamPacketParser = require('./stream/DemoStreamPacketParser'),
    DemoStreamPacketPrioritizer = require('./stream/DemoStreamPacketPrioritizer');

const LoggerProvider = require('./providers/LoggerProvider.instance');

const MemoryTracker = require('./trackers/MemoryTracker'),
    PacketTracker = require('./trackers/PacketTracker'),
    PerformanceTracker = require('./trackers/PerformanceTracker');

const WorkerManager = require('./workers/WorkerManager');

const loggerForMemory = LoggerProvider.getLogger('Tracker/Memory');
const loggerForPacket = LoggerProvider.getLogger('Tracker/Packet');
const loggerForPerformance = LoggerProvider.getLogger('Tracker/Performance');

const logger = LoggerProvider.getLogger('Parser');

class Parser {
    constructor(
        parserThreads = 0,
        splitterChunkSize = 200 * 1024,
        batcherChunkSize = 100 * 1024,
        batcherThresholdMilliseconds = 50
    ) {
        assert(Number.isInteger(parserThreads));
        assert(Number.isInteger(splitterChunkSize));
        assert(Number.isInteger(batcherChunkSize));
        assert(Number.isInteger(batcherThresholdMilliseconds));

        this._isMultiThreaded = parserThreads > 0;

        if (!this._isMultiThreaded) {
            this._workerManager = null;
        } else {
            this._workerManager = new WorkerManager(parserThreads);
        }

        this._demo = new Demo();

        this._chain = [
            new DemoStreamBufferSplitter(this, splitterChunkSize),
            new DemoStreamPacketExtractor(this),
            new DemoStreamPacketBatcher(this, batcherChunkSize, batcherThresholdMilliseconds),
            new DemoStreamPacketParser(this),
            new DemoStreamPacketCoordinator(this),
            new DemoStreamPacketPrioritizer(this),
            new DemoStreamPacketAnalyzer(this)
        ];

        this._trackers = {
            memory: new MemoryTracker(loggerForMemory),
            packet: new PacketTracker(loggerForPacket),
            performance: new PerformanceTracker(loggerForPerformance)
        };
    }

    /**
     * @public
     * @returns {Demo}
     */
    get demo() {
        return this._demo;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get isMultiThreaded() {
        return this._isMultiThreaded;
    }

    /**
     * @public
     * @returns {PacketTracker}
     */
    get packetTracker() {
        return this._trackers.packet;
    }

    /**
     * @public
     * @returns {PerformanceTracker}
     */
    get performanceTracker() {
        return this._trackers.performance;
    }

    /**
     * @public
     * @returns {WorkerManager|null}
     */
    get workerManager() {
        return this._workerManager;
    }

    /**
     * @public
     */
    pause() {
        this._onPause();

        throw new Error('Not implemented');
    }

    /**
     * @public
     */
    resume() {
        this._onResume();

        throw new Error('Not implemented');
    }

    /**
     * @public
     * @param {Stream.Readable} reader
     */
    start(reader) {
        assert(reader instanceof Stream.Readable);

        this._onStart();

        Stream.pipeline(
            reader,
            ...this._chain,
            (error) => {
                if (error) {
                    this._onError(error);
                }

                this._onFinish();
            }
        )
    }

    /**
     * @public
     */
    stop() {
        this._onStop();

        throw new Error('Not implemented');
    }

    /**
     * @protected
     * @param {Error} error
     */
    _onError(error) {
        logger.error(`Parse failed`, error);
    }

    /**
     * @protected
     */
    _onFinish() {
        logger.info(`Parse finished`);

        this._trackers.performance.end(PerformanceTrackerCategory.PARSER);

        this._trackers.memory.print();
        this._trackers.packet.print();
        this._trackers.performance.print();

        this._trackers.memory.dispose();
        this._trackers.packet.dispose();
        this._trackers.performance.dispose();

        if (this._workerManager !== null) {
            this._workerManager.terminate();
        }
    }

    /**
     * @protected
     */
    _onPause() {
        logger.info(`Parse paused`);
    }

    /**
     * @protected
     */
    _onResume() {
        logger.info(`Parse resumed`);
    }

    /**
     * @protected
     */
    _onStart() {
        logger.info(`Parse started`);

        this._trackers.performance.start(PerformanceTrackerCategory.PARSER);
    }

    /**
     * @protected
     */
    _onStop() {
        logger.info(`Parse stopped`);
    }
}

module.exports = Parser;

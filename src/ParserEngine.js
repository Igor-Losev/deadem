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

const ParserConfiguration = require('./ParserConfiguration');

const loggerForMemory = LoggerProvider.getLogger('Tracker/Memory');
const loggerForPacket = LoggerProvider.getLogger('Tracker/Packet');
const loggerForPerformance = LoggerProvider.getLogger('Tracker/Performance');

const logger = LoggerProvider.getLogger('ParserEngine');

class ParserEngine {
    /**
     * @public
     * @param {ParserConfiguration} configuration
     */
    constructor(configuration) {
        if (!(configuration instanceof ParserConfiguration)) {
            throw new Error('Invalid configuration: expected an instance of ParserConfiguration');
        }

        if (configuration.parserThreads === 0) {
            this._workerManager = null;
        } else {
            this._workerManager = new WorkerManager(configuration.parserThreads);
        }

        this._configuration = configuration;

        this._demo = new Demo();

        this._chain = [
            new DemoStreamBufferSplitter(this, configuration.splitterChunkSize),
            new DemoStreamPacketExtractor(this),
            new DemoStreamPacketBatcher(this, configuration.batcherChunkSize, configuration.batcherThresholdMilliseconds),
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
     * @returns {WorkerManager|null}
     */
    get workerManager() {
        return this._workerManager;
    }

    /**
     * @public
     * @returns {MemoryTracker}
     */
    getMemoryTracker() {
        return this._trackers.memory;
    }

    /**
     * @public
     * @returns {boolean}
     */
    getIsMultiThreaded() {
        return this._configuration.parserThreads > 0;
    }

    /**
     * @public
     * @returns {PacketTracker}
     */
    getPacketTracker() {
        return this._trackers.packet;
    }

    /**
     * @public
     * @returns {PerformanceTracker}
     */
    getPerformanceTracker() {
        return this._trackers.performance;
    }

    /**
     * @public
     * @param {Stream.Readable} reader
     */
    start(reader) {
        assert(reader instanceof Stream.Readable);

        logger.info('Parse started');

        this._trackers.performance.start(PerformanceTrackerCategory.PARSER);

        Stream.pipeline(
            reader,
            ...this._chain,
            (error) => {
                if (error) {
                    logger.error(`Parse failed`, error);
                }

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

                logger.info('Parse finished');
            }
        );
    }
}

module.exports = ParserEngine;

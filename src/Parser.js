'use strict';

const assert = require('node:assert/strict'),
    Stream = require('node:stream');

const Demo = require('./data/Demo');

const PerformanceTrackerCategory = require('./data/enums/PerformanceTrackerCategory'),
    StreamPhase = require('./data/enums/StreamPhase');

const DemoStreamBufferSplitter = require('./stream/DemoStreamBufferSplitter'),
    DemoStreamPacketAnalyzer = require('./stream/DemoStreamPacketAnalyzer'),
    DemoStreamPacketBatcher = require('./stream/DemoStreamPacketBatcher'),
    DemoStreamPacketCoordinator = require('./stream/DemoStreamPacketCoordinator'),
    DemoStreamPacketExtractor = require('./stream/DemoStreamPacketExtractor'),
    DemoStreamPacketParser = require('./stream/DemoStreamPacketParser');

const LoggerProvider = require('./providers/LoggerProvider.instance');

const PacketTracker = require('./trackers/PacketTracker'),
    PerformanceTracker = require('./trackers/PerformanceTracker');

const logger = LoggerProvider.getLogger('Parser');

class Parser {
    constructor(
        parserThreads = 1,
        splitterChunkSize = 200 * 1024,
        batcherChunkSize = 100 * 1024,
        batcherThresholdMilliseconds = 50
    ) {
        assert(Number.isInteger(parserThreads));
        assert(Number.isInteger(splitterChunkSize));
        assert(Number.isInteger(batcherChunkSize));
        assert(Number.isInteger(batcherThresholdMilliseconds));

        this._parserThreads = parserThreads;
        this._splitterChunkSize = splitterChunkSize;
        this._batcherChunkSize = batcherChunkSize;
        this._batcherThresholdMilliseconds = batcherThresholdMilliseconds;

        this._demo = new Demo();
        this._chain = getChain.call(this);

        this._trackers = {
            packet: new PacketTracker(),
            performance: new PerformanceTracker()
        };
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
                const parser = this._chain.find(i => i instanceof DemoStreamPacketParser) || null;

                if (parser !== null) {
                    parser.dispose();
                }

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

        this._trackers.packet.print();
        this._trackers.performance.print();
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

function getChain() {
    const phases = StreamPhase.getAll();

    phases.sort((a, b) => a.order - b.order);

    return phases.reduce((accumulator, phase) => {
        let part = null;

        switch (phase) {
            case StreamPhase.ANALYZE:
                part = new DemoStreamPacketAnalyzer(this);

                break;
            case StreamPhase.BATCH:
                part = new DemoStreamPacketBatcher(this, this._batcherChunkSize, this._batcherThresholdMilliseconds);

                break;
            case StreamPhase.COORDINATE:
                part = new DemoStreamPacketCoordinator(this);

                break;
            case StreamPhase.EXTRACT:
                part = new DemoStreamPacketExtractor(this);

                break;
            case StreamPhase.PARSE:
                part = new DemoStreamPacketParser(this, this._parserThreads);

                break;
            case StreamPhase.READ:
                break;
            case StreamPhase.SPLIT:
                part = new DemoStreamBufferSplitter(this, this._splitterChunkSize);

                break;
            default:
                break;
        }

        if (part !== null) {
            accumulator.push(part);
        }

        return accumulator;
    }, [ ]);
}

module.exports = Parser;

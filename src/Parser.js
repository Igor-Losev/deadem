'use strict';

const assert = require('node:assert/strict'),
    Stream = require('node:stream');

const Demo = require('./data/Demo');

const PerformanceTrackerCategory = require('./data/enums/PerformanceTrackerCategory'),
    StreamPhase = require('./data/enums/StreamPhase');

const DemoStreamPacketAnalyzer = require('./stream/DemoStreamPacketAnalyzer'),
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
        threads = 1,
        parseBatchSize = 100 * 1024,
        parseBatchThresholdMilliseconds = 50
    ) {
        assert(Number.isInteger(threads));
        assert(Number.isInteger(parseBatchSize));
        assert(Number.isInteger(parseBatchThresholdMilliseconds));

        this._threads = threads;

        this._parseBatchSize = parseBatchSize;
        this._parseBatchThresholdMilliseconds = parseBatchThresholdMilliseconds;

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
    }

    /**
     * @public
     */
    resume() {
        this._onResume();
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
                part = new DemoStreamPacketBatcher(this, this._parseBatchSize, this._parseBatchThresholdMilliseconds);

                break;
            case StreamPhase.COORDINATE:
                part = new DemoStreamPacketCoordinator(this);

                break;
            case StreamPhase.EXTRACT:
                part = new DemoStreamPacketExtractor(this);

                break;
            case StreamPhase.PARSE:
                part = new DemoStreamPacketParser(this, this._threads);

                break;
            case StreamPhase.READ:
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

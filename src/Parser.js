'use strict';

const assert = require('node:assert/strict'),
    Stream = require('node:stream');

const Demo = require('./data/Demo');

const StreamPhase = require('./data/enums/StreamPhase');

const DemoStreamPacketAnalyzer = require('./stream/DemoStreamPacketAnalyzer'),
    DemoStreamPacketBatcher = require('./stream/DemoStreamPacketBatcher'),
    DemoStreamPacketCoordinator = require('./stream/DemoStreamPacketCoordinator'),
    DemoStreamPacketExtractor = require('./stream/DemoStreamPacketExtractor'),
    DemoStreamPacketParser = require('./stream/DemoStreamPacketParser');

const LoggerProvider = require('./providers/LoggerProvider.instance');

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
    }

    pause() {
        this._onPause();
    }

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

    stop() {
        this._onStop();
    }

    _onError(error) {
        logger.error(`Parse failed`, error);
    }

    _onFinish() {
        logger.info(`Parse finished`);
    }

    _onPause() {
        logger.info(`Parse paused`);
    }

    _onResume() {
        logger.info(`Parse resumed`);
    }

    _onStart() {
        logger.info(`Parse started`);
    }

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
                part = new DemoStreamPacketAnalyzer();

                break;
            case StreamPhase.BATCH:
                part = new DemoStreamPacketBatcher(this._parseBatchSize, this._parseBatchThresholdMilliseconds);

                break;
            case StreamPhase.COORDINATE:
                part = new DemoStreamPacketCoordinator();

                break;
            case StreamPhase.EXTRACT:
                part = new DemoStreamPacketExtractor();

                break;
            case StreamPhase.PARSE:
                part = new DemoStreamPacketParser(this._threads);

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

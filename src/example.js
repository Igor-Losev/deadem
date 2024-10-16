const fs = require('fs'),
    path = require('path'),
    Stream = require('stream');

const PerformanceTrackerCategory = require('./definitions/PerformanceTrackerCategory');

const DemoStreamPacketExtractor = require('./stream/DemoStreamPacketExtractor'),
    DemoStreamPacketParser = require('./stream/DemoStreamPacketParser');

const LoggerProvider = require('./providers/LoggerProvider.instance');

const PerformanceTracker = require('./trackers/PerformanceTracker.instance');

const logger = LoggerProvider.getLogger();

const demoPath = path.resolve(__dirname, './../demos/discord.dem');
// const demoPath = path.resolve(__dirname, './../demos/21438112.dem');
const demoProtoPath = path.resolve(__dirname, './../proto/demo.proto');

(async () => {
    logger.debug(`Starting script [ example.js ]`);

    PerformanceTracker.start(PerformanceTrackerCategory.SCRIPT);

    const reader = fs.createReadStream(demoPath, { highWaterMark: 65536 * 8 });

    const extractor = new DemoStreamPacketExtractor();

    const parser = new DemoStreamPacketParser(demoProtoPath);

    Stream.pipeline(
        reader,
        extractor,
        parser,
        (error) => {
            PerformanceTracker.end(PerformanceTrackerCategory.SCRIPT);

            if (error) {
                logger.error(error);
            }

            logger.debug(`Extracted [ ${extractor.counts.packets} ] packets within [ ${extractor.counts.chunks} ] chunks`);

            logger.info('Finished script [ example.js ]');

            PerformanceTracker.print();
        }
    );
})();



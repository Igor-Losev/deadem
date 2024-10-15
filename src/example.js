const fs = require('fs'),
    path = require('path'),
    Stream = require('stream');

const DemoStreamPacketExtractor = require('./stream/DemoStreamPacketExtractor'),
    DemoStreamPacketParser = require('./stream/DemoStreamPacketParser');

const LoggerProvider = require('./providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger();

const demoPath = path.resolve(__dirname, './../demos/discord.dem');
// const demoPath = path.resolve(__dirname, './../demos/21438112.dem');
const demoProtoPath = path.resolve(__dirname, './../proto/demo.proto');

(async () => {
    const start = Date.now();

    logger.debug(`Starting script [ example.js ]`);

    const reader = fs.createReadStream(demoPath, { highWaterMark: 65536 * 8 });

    const extractor = new DemoStreamPacketExtractor();

    const parser = new DemoStreamPacketParser(demoProtoPath);

    Stream.pipeline(
        reader,
        extractor,
        parser,
        (error) => {
            if (error) {
                logger.error(error);
            }

            const end = Date.now();

            logger.debug(`Extracted [ ${extractor.counts.packets} ] packets within [ ${extractor.counts.chunks} ] chunks`);

            logger.info(`Finished script [ example.js ]. Execution time: [ ${end - start}ms ]`);
        }
    );
})();



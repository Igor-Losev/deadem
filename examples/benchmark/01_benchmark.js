import { Logger, Parser, ParserConfiguration } from '#root/index.js';

import DemoFile from '#root/examples/node/helpers/DemoFile.js';
import DemoProvider from '#root/examples/node/helpers/DemoProvider.js';

import Benchmark from './helpers/Benchmark.js';

const CONFIG = {
    DEMOS: [ DemoFile.MATCH_36126420 ],
    REPEATS: 30
};

(async () => {
    if (typeof global.gc !== 'function') {
        throw new Error('Run node with --expose-gc');
    }

    const logger = Logger.CONSOLE_INFO;

    const benchmark = new Benchmark();

    for (let demoIndex = 0; demoIndex < CONFIG.DEMOS.length; demoIndex++) {
        const demo = CONFIG.DEMOS[demoIndex];

        logger.info(`Running a batch of demo [ ${demo.id} ] parses - [ ${CONFIG.REPEATS} ] repeats`);

        for (let counter = 0; counter < CONFIG.REPEATS; counter++) {
            let readable = await DemoProvider.read(demo);
            let parser = new Parser(ParserConfiguration.DEFAULT, Logger.CONSOLE_WARN);

            await benchmark.parse(parser, readable);

            readable = null;
            parser = null;

            await pause(50);

            global.gc();
        }

        logger.info(`Finished a batch of demo [ ${demo.id} ] parses - [ ${CONFIG.REPEATS} ] repeats`);
    }

    console.log(benchmark.getResult());
})();

function pause(ms = 50) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

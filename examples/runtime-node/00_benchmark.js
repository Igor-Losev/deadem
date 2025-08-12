import { Logger, Parser, ParserConfiguration } from '#root/index.js';

import Benchmark from '#root/examples/common/Benchmark.js';
import DemoFile from '#root/examples/common/DemoFile.js';

import DemoProvider from './helpers/DemoProvider.js';

const CONFIG = {
    DEMOS: [ DemoFile.REPLAY_38625795 ],
    REPEATS: 10
};

(async () => {
    if (typeof global.gc !== 'function') {
        throw new Error('Run node with --expose-gc');
    }

    const logger = Logger.CONSOLE_INFO;

    const benchmark = new Benchmark();
    const configuration = new ParserConfiguration({ parserThreads: 3 });

    for (let demoIndex = 0; demoIndex < CONFIG.DEMOS.length; demoIndex++) {
        const demo = CONFIG.DEMOS[demoIndex];

        logger.info(`Running a batch of demo [ ${demo.id} ] parses - [ ${CONFIG.REPEATS} ] repeats`);

        for (let counter = 0; counter < CONFIG.REPEATS; counter++) {
            let readable = await DemoProvider.read(demo);
            let parser = new Parser(configuration, Logger.CONSOLE_WARN);

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

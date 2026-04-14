import { ParserConfiguration, Player } from 'deadem';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';

import DemoProvider from '#root/providers/DemoProvider.js';

const formatMB = (bytes) => (bytes / 1024 / 1024).toFixed(1);

const mem = () => {
    if (global.gc) global.gc();

    const m = process.memoryUsage();

    console.log(`heap: ${formatMB(m.heapUsed)} MB, rss: ${formatMB(m.rss)} MB, external: ${formatMB(m.external)} MB, arrayBuffers: ${formatMB(m.arrayBuffers)} MB`);
};

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_51541762);

    const player = new Player(new ParserConfiguration({ parserThreads: 0 }));

    await player.load(reader);

    console.log(`Loaded. Ticks: ${player.getFirstTick()} — ${player.getLastTick()}`);

    mem();

    const ITERATIONS = 500;
    const SEEK_TICK = 40234;

    for (let i = 0; i < ITERATIONS; i++) {
        await player.seekToTick(SEEK_TICK);
        await new Promise(r => setTimeout(r, 0));

        if (i % 10 === 9) {
            console.log(`[${i + 1}/${ITERATIONS}]`);
            mem();
        }
    }

    console.log('Done.');

    mem();

    await player.dispose();
})();

import { ParserConfiguration, Player, Printer } from 'deadem';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';

import DemoProvider from '#root/providers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_51541762);

    const player = new Player(new ParserConfiguration({ parserThreads: 0 }));

    await player.load(reader);

    console.log(`Loaded. Ticks: ${player.getFirstTick()} — ${player.getLastTick()}`);
    console.log(`Current tick: ${player.getCurrentTick()}`);

    await player.nextTick();
    console.log(`Next tick: ${player.getCurrentTick()}`);

    await player.nextTick();
    console.log(`Next tick: ${player.getCurrentTick()}`);

    await player.prevTick();
    console.log(`Prev tick: ${player.getCurrentTick()}`);

    await player.seekToTick(20000);
    console.log(`Seek to 20000: ${player.getCurrentTick()}`);

    await player.seekToTick(player.getLastTick());
    console.log(`Seek to end: ${player.getCurrentTick()}`);

    await player.dispose();

    const printer = new Printer(player);

    printer.printMemoryStats();
})();

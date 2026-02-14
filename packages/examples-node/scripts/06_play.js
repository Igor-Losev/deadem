import { ParserConfiguration, Player } from 'deadem';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';

import DemoProvider from '#root/providers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_51541762);

    const player = new Player(new ParserConfiguration({ parserThreads: 3 }));

    const print = () => {
        console.log(`Tick: [ ${player.ticks.current} ] out of [ ${player.ticks.last} ]`);
    };

    await player.load(reader);

    print();

    await player.seekToTick(40234);

    print();

    await player.nextTick();

    player.abo

    print();

    await player.prevTick();

    print();

    await player.dispose();
})();

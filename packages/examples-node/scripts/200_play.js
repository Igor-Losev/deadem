import { Logger, ParserConfiguration, PlaybackInterruptedError, Player } from 'deadem';

import DemoFile from 'deadem-examples-common/data/DemoFile.js';

import DemoProvider from '#root/providers/DemoProvider.js';

const PLAYBACK_SPEED = 16;

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_75438101);

    const player = new Player(new ParserConfiguration({ parserThreads: 0 }), Logger.CONSOLE_WARN);

    const printTick = () => {
        console.log(`Current tick: [ ${player.getCurrentTick()} ]`);
    };

    await player.load(reader);

    console.log(`Loaded. Ticks: [ ${player.getFirstTick()} ] — [ ${player.getLastTick()} ]`);

    printTick();

    await player.nextTick();
    await player.nextTick();

    printTick();

    await player.seekToTick(50000);

    printTick();

    console.log(`Playing at speed [ ${PLAYBACK_SPEED}x ] ...`);

    const playPromise = player.play(PLAYBACK_SPEED)
        .catch((err) => {
            if (!(err instanceof PlaybackInterruptedError)) {
                throw err;
            }
        });

    setTimeout(() => {
        console.log('Stopping ...');

        player.pause();
    }, 1000);

    await playPromise;

    printTick();

    await player.seekToTick(player.getLastTick());

    printTick();

    await player.dispose();
})();

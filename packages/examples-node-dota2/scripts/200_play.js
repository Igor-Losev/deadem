import { Logger, ParserConfiguration, PlaybackInterruptedError, Player } from '@deademx/dota2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

const PLAYBACK_DURATION_MS = 1000;
const PLAYBACK_SPEED = 16;

(async () => {
    const reader = await DemoProvider.read(DemoFile.DOTA2_REPLAY_8777738576);
    const player = new Player(new ParserConfiguration({ parserThreads: 0 }), Logger.CONSOLE_WARN);

    const printTick = () => {
        console.log(`Current tick: [ ${player.getCurrentTick()} ]`);
    };

    await player.load(reader);

    console.log(`Loaded. Ticks: [ ${player.getFirstTick()} ] - [ ${player.getLastTick()} ]`);

    printTick();

    await player.nextTick();
    await player.nextTick();

    printTick();

    const middleTick = Math.floor((player.getFirstTick() + player.getLastTick()) / 2);

    await player.seekToTick(middleTick);

    printTick();

    console.log(`Playing at speed [ ${PLAYBACK_SPEED}x ] for [ ${PLAYBACK_DURATION_MS} ] ms ...`);

    const playPromise = player.play(PLAYBACK_SPEED)
        .catch((err) => {
            if (!(err instanceof PlaybackInterruptedError)) {
                throw err;
            }
        });

    setTimeout(() => {
        console.log('Stopping ...');

        player.pause();
    }, PLAYBACK_DURATION_MS);

    await playPromise;

    printTick();

    await player.seekToTick(player.getLastTick());

    printTick();

    await player.dispose();
})();

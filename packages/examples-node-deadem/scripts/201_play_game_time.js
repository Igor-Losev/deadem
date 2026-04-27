import { Player } from 'deadem';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DeadlockGameObserver from '@deademx/examples-common/data/DeadlockGameObserver.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.DEADLOCK_REPLAY_75438101);

    const player = new Player();
    const gameObserver = new DeadlockGameObserver(player);

    await player.load(reader);
    await player.seekToTick(player.getLastTick());

    await player.dispose();

    console.log(`Game finished in: [ ${gameObserver.getGameClockFormatted()} ]. Demo duration [ ${gameObserver.getTotalClockFormatted()} ]`);
})();

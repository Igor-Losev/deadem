import { Player } from 'deadem';

import DemoFile from '@deadem/examples-common/data/DemoFile.js';
import GameObserver from '@deadem/examples-common/data/GameObserver.js';

import DemoProvider from '#root/providers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_75438101);

    const player = new Player();
    const gameObserver = new GameObserver(player);

    await player.load(reader);
    await player.seekToTick(player.getLastTick());

    await player.dispose();

    console.log(`Game finished in: [ ${gameObserver.getGameClockFormatted()} ]. Demo duration [ ${gameObserver.getTotalClockFormatted()} ]`);
})();

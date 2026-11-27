import { ConsoleCommandType, Cutter, CutterConfiguration, Logger } from '@deademx/dota2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';
import FileSystem from '@deademx/examples-common/data/FileSystem.js';

// BLAST SLAM VIII (Aurora Gaming vs Team Spirit, Map 2): triple kill by Yatoro (Outworld Destroyer, hero index 6) at ticks 94552, 95038, 95058.
const TICK_RATE = 30;
const TARGET_TICK = 94552;

const WINDOW_BEFORE_TICKS = TICK_RATE * 10;
const WINDOW_AFTER_TICKS = TICK_RATE * 25;

const SPECTATOR_MODE_PLAYER_PERSPECTIVE = 3;
const HERO_INDEX = 6;

(async () => {
    const demoFile = DemoFile.DOTA2_REPLAY_9036234584;
    const getReader = () => DemoProvider.resolve(demoFile);

    const cutter = new Cutter(CutterConfiguration.DEFAULT, Logger.CONSOLE_INFO);

    await cutter.index(await getReader());

    const from = TARGET_TICK - WINDOW_BEFORE_TICKS;
    const to = TARGET_TICK + WINDOW_AFTER_TICKS;

    const buffer = await cutter.cut(await getReader(), from, to, [
        ConsoleCommandType.DOTA_SPECTATOR_MODE.create(SPECTATOR_MODE_PLAYER_PERSPECTIVE),
        ConsoleCommandType.DOTA_SPECTATOR_HERO_INDEX.create(HERO_INDEX)
    ]);

    const outputPath = `./${demoFile.id}-${from}-${to}.dem`;

    FileSystem.writeFile(outputPath, buffer);

    console.log(`Saved [ ${outputPath} ] (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
})();

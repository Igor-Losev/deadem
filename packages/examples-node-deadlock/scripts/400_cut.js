import { ConsoleCommandType, Cutter, CutterConfiguration, Logger } from '@deademx/deadlock';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';
import FileSystem from '@deademx/examples-common/data/FileSystem.js';

// Final teamfight (35:35-36:07): double kill by Zerggy (slot 4) at ticks 155134 and 156176.
const TICK_RATE = 64;
const TARGET_TICK = 155134;

const WINDOW_BEFORE_TICKS = TICK_RATE * 10;
const WINDOW_AFTER_TICKS = TICK_RATE * 30;

const PLAYER_SLOT = 4;

(async () => {
    const demoFile = DemoFile.DEADLOCK_REPLAY_112633589;
    const getReader = () => DemoProvider.resolve(demoFile);

    const cutter = new Cutter(CutterConfiguration.DEFAULT, Logger.CONSOLE_INFO);

    await cutter.index(await getReader());

    const from = TARGET_TICK - WINDOW_BEFORE_TICKS;
    const to = TARGET_TICK + WINDOW_AFTER_TICKS;

    const buffer = await cutter.cut(await getReader(), from, to, [
        ConsoleCommandType.SPEC_PLAYER.create(PLAYER_SLOT)
    ]);

    const outputPath = `./${demoFile.id}-${from}-${to}.dem`;

    FileSystem.writeFile(outputPath, buffer);

    console.log(`Saved [ ${outputPath} ] (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);
})();

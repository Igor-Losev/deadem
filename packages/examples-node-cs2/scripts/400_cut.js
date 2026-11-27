import { ConsoleCommandType, Cutter, CutterConfiguration, Logger } from '@deademx/cs2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';
import FileSystem from '@deademx/examples-common/data/FileSystem.js';

// ESL Pro League Season 24 (Falcons vs Natus Vincere, Inferno): AWP collateral + triple kill by m0NESY (slot 13) at ticks 54059 and 54256.
const TICK_RATE = 64;
const TARGET_TICK = 54059;

const WINDOW_BEFORE_TICKS = TICK_RATE * 10;
const WINDOW_AFTER_TICKS = TICK_RATE * 15;

const PLAYER_SLOT = 13;

(async () => {
    const demoFile = DemoFile.CS2_REPLAY_20261006_FALCONS_VS_NATUS_VINCERE_M1_INFERNO;
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

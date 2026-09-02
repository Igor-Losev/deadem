import { Parser } from '@deademx/cs2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import ProfileRunner from '@deademx/examples-common/data/ProfileRunner.js';

await ProfileRunner({
    Parser,
    demoFile: DemoFile.CS2_REPLAY_20260815_SPIRIT_VS_BIG_M3_MIRAGE
});

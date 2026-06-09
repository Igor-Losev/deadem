import { Parser } from '@deademx/cs2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import ProfileRunner from '@deademx/examples-common/data/ProfileRunner.js';

await ProfileRunner({
    Parser,
    demoFile: DemoFile.CS2_REPLAY_20260511_FURIA_VS_SPIRIT_M1_DUST2
});

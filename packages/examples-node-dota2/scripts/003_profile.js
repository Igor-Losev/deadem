import { Parser } from '@deademx/dota2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import ProfileRunner from '@deademx/examples-common/data/ProfileRunner.js';

await ProfileRunner({
    Parser,
    demoFile: DemoFile.DOTA2_REPLAY_8783006717
});

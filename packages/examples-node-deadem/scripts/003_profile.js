import { Parser } from 'deadem';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import ProfileRunner from '@deademx/examples-common/data/ProfileRunner.js';

await ProfileRunner({
    Parser,
    demoFile: DemoFile.DEADLOCK_REPLAY_75438101
});

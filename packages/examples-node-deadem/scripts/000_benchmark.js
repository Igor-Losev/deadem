import { MessagePacketType, Parser, ParserConfiguration } from 'deadem';

import BenchmarkRunner from '@deademx/examples-common/data/BenchmarkRunner.js';
import DemoFile from '@deademx/examples-common/data/DemoFile.js';

const CASES = [
    {
        id: 1,
        label: 'All packet types (entities included)',
        configuration: ParserConfiguration.DEFAULT
    },
    {
        id: 2,
        label: 'All packet types, single entity class only (`CCitadelPlayerController`)',
        configuration: new ParserConfiguration({ entityClasses: [ 'CCitadelPlayerController' ] })
    },
    {
        id: 3,
        label: 'All packet types, SVC_PACKET_ENTITIES excluded',
        configuration: new ParserConfiguration({ messagePacketTypesExclude: [ MessagePacketType.SVC_PACKET_ENTITIES ] })
    },
    {
        id: 4,
        label: 'Single MessagePacketType only',
        configuration: new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.CITADEL_USER_MESSAGE_CHAT_MESSAGE ] })
    }
];

await BenchmarkRunner({
    Parser,
    demoFile: DemoFile.DEADLOCK_REPLAY_75438101,
    tickRate: 64,
    cases: CASES
});

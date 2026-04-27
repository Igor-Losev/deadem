import { MessagePacketType, Parser, ParserConfiguration } from '@deademx/dota2';

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
        label: 'All packet types, single entity class only (`CDOTAPlayerController`)',
        configuration: new ParserConfiguration({ entityClasses: [ 'CDOTAPlayerController' ] })
    },
    {
        id: 3,
        label: 'All packet types, SVC_PACKET_ENTITIES excluded',
        configuration: new ParserConfiguration({ messagePacketTypesExclude: [ MessagePacketType.SVC_PACKET_ENTITIES ] })
    },
    {
        id: 4,
        label: 'Single MessagePacketType only',
        configuration: new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.DOTA_UM_CHAT_MESSAGE ] })
    }
];

await BenchmarkRunner({
    Parser,
    demoFile: DemoFile.DOTA2_REPLAY_8783006717,
    tickRate: 30,
    cases: CASES
});

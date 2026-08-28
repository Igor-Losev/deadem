import { MessagePacketType, Parser, ParserConfiguration } from '@deademx/dota2';

import BenchmarkRunner from '@deademx/examples-common/data/BenchmarkRunner.js';
import DemoFile from '@deademx/examples-common/data/DemoFile.js';

const CASES = [
    {
        id: 1,
        label: 'Everything — `ParserConfiguration.DEFAULT`',
        configuration: ParserConfiguration.DEFAULT
    },
    {
        id: 2,
        label: 'Chat — `messagePacketTypes: [ DOTA_UM_CHAT_MESSAGE ]`',
        configuration: new ParserConfiguration({
            messagePacketTypes: [ MessagePacketType.DOTA_UM_CHAT_MESSAGE ]
        })
    },
    {
        id: 3,
        label: 'One entity class — `SVC_PACKET_ENTITIES` + `entityClasses: [ CDOTAPlayerController ]`',
        configuration: new ParserConfiguration({
            messagePacketTypes: [ MessagePacketType.SVC_PACKET_ENTITIES ],
            entityClasses: [ 'CDOTAPlayerController' ]
        })
    }
];

const args = parseArgs(process.argv);
const cases = args.caseId === null ? CASES : CASES.filter(c => c.id === args.caseId);

if (cases.length === 0) {
    throw new Error(`Unknown --bench-case-id [ ${args.caseId} ]`);
}

await BenchmarkRunner({
    Parser,
    demoFile: DemoFile.DOTA2_REPLAY_8783006717,
    tickRate: 30,
    cases,
    repeats: args.repeats
});

function parseArgs(argv) {
    const repeatsRaw = argv.find(a => a.startsWith('--repeats='))?.slice('--repeats='.length) || null;
    const caseIdRaw = argv.find(a => a.startsWith('--bench-case-id='))?.slice('--bench-case-id='.length) || null;

    const repeats = repeatsRaw === null ? 10 : Number.parseInt(repeatsRaw, 10);
    const caseId = caseIdRaw === null ? null : Number.parseInt(caseIdRaw, 10);

    if (!Number.isInteger(repeats) || repeats <= 0) {
        throw new Error('--repeats must be a positive integer');
    }

    if (caseId !== null && !Number.isInteger(caseId)) {
        throw new Error('--bench-case-id must be an integer');
    }

    return { repeats, caseId };
}

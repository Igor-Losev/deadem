import { MessagePacketType, Parser, ParserConfiguration } from '@deademx/cs2';

import BenchmarkRunner from '@deademx/examples-common/data/BenchmarkRunner.js';
import DemoFile from '@deademx/examples-common/data/DemoFile.js';

const CASES = [
    {
        id: 1,
        label: 'No filters (full replay state)',
        configuration: ParserConfiguration.DEFAULT
    },
    {
        id: 2,
        label: '`messagePacketTypes` allowlist excluding `SVC_PACKET_ENTITIES` (chat-only)',
        configuration: new ParserConfiguration({
            messagePacketTypes: [ MessagePacketType.USER_MESSAGE_SAY_TEXT_2 ]
        })
    },
    {
        id: 3,
        label: '`messagePacketTypes: [ SVC_PACKET_ENTITIES ]` + `entityClasses: [ CCSPlayerController ]`',
        configuration: new ParserConfiguration({
            messagePacketTypes: [ MessagePacketType.SVC_PACKET_ENTITIES ],
            entityClasses: [ 'CCSPlayerController' ]
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
    demoFile: DemoFile.CS2_REPLAY_SAMPLE,
    tickRate: 64,
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

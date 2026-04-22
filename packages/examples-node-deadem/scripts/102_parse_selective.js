import { MessagePacketType, Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.DEADLOCK_REPLAY_51541762);

    const parser = new Parser(new ParserConfiguration({
        parserThreads: 3,
        messagePacketTypesExclude: [ MessagePacketType.SVC_PACKET_ENTITIES ]
    }));

    await parser.parse(reader);
    await parser.dispose();

    const printer = new Printer(parser);

    printer.printStats();
})();

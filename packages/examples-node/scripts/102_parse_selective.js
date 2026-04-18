import { MessagePacketType, Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from '@deadem/examples-common/data/DemoFile.js';

import DemoProvider from '#root/providers/DemoProvider.js';

(async () => {
    const reader = await DemoProvider.read(DemoFile.REPLAY_51541762);

    const parser = new Parser(new ParserConfiguration({
        parserThreads: 3,
        messagePacketTypesExclude: [ MessagePacketType.SVC_PACKET_ENTITIES ]
    }));

    await parser.parse(reader);
    await parser.dispose();

    const printer = new Printer(parser);

    printer.printStats();
})();

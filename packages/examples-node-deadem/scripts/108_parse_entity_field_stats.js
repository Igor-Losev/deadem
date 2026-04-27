import { EntityOperation, InterceptorStage, MessagePacketType, Parser, ParserConfiguration, Printer } from 'deadem';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';

import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

const TOP_CLASSES = 10;
const TOP_FIELDS_PER_CLASS = 5;

(async () => {
    const reader = await DemoProvider.read(DemoFile.DEADLOCK_REPLAY_75438101);

    const parser = new Parser(new ParserConfiguration({
        parserThreads: 0,
        messagePacketTypes: [ MessagePacketType.SVC_PACKET_ENTITIES ]
    }));

    const printer = new Printer(parser);

    const stats = new Map();

    parser.registerPostInterceptor(InterceptorStage.ENTITY_PACKET, (demoPacket, messagePacket, events) => {
        for (let i = 0; i < events.length; i++) {
            const event = events[i];

            if (event.operation !== EntityOperation.UPDATE && event.operation !== EntityOperation.CREATE) {
                continue;
            }

            const className = event.entity.class.name;

            let perClass = stats.get(className);

            if (perClass === undefined) {
                perClass = { total: 0, fields: new Map() };

                stats.set(className, perClass);
            }

            const changes = event.getChanges();
            const names = Object.keys(changes);

            perClass.total += names.length;

            for (let j = 0; j < names.length; j++) {
                const name = names[j];

                perClass.fields.set(name, (perClass.fields.get(name) || 0) + 1);
            }
        }
    });

    await parser.parse(reader);
    await parser.dispose();

    const ranked = [ ...stats.entries() ]
        .map(([ className, perClass ]) => ({ className, total: perClass.total, fields: perClass.fields }))
        .sort((a, b) => b.total - a.total)
        .slice(0, TOP_CLASSES);

    console.log('Top entity classes by mutation volume:');

    for (const { className, total, fields } of ranked) {
        console.log(`  [ ${className} ]: ${total} mutations`);

        const top = [ ...fields.entries() ]
            .sort((a, b) => b[1] - a[1])
            .slice(0, TOP_FIELDS_PER_CLASS);

        for (const [ name, count ] of top) {
            console.log(`    ${name}: ${count}`);
        }
    }

    printer.printStats();
})();

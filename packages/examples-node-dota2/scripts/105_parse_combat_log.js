import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, StringTableType } from '@deademx/dota2';
import { DOTA_COMBATLOG_TYPES } from '@deademx/dota2/proto';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

/**
 * @param {number} type
 * @returns {string}
 */
function getTypeLabel(type) {
    return DOTA_COMBATLOG_TYPES[type]?.replace('DOTA_COMBATLOG_', '') ?? `TYPE_${type}`;
}

(async () => {
    const reader = await DemoProvider.resolve(DemoFile.DOTA2_REPLAY_8783006717);
    const parser = new Parser(new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.DOTA_UM_COMBAT_LOG_DATA_HLTV ] }));

    let counter = 0;

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
        if (messagePacket.type !== MessagePacketType.DOTA_UM_COMBAT_LOG_DATA_HLTV) {
            return;
        }

        const entry = messagePacket.data;

        counter += 1;

        const names = parser.getDemo().stringTableContainer.getByType(StringTableType.COMBAT_LOG_NAMES);
        const name = (id) => names?.getEntryById(id)?.key || `#${id}`;

        const parts = [
            `#${counter}`,
            `tick=${demoPacket.tick}`,
            `${(entry.timestamp ?? 0).toFixed(1)}s`,
            getTypeLabel(entry.type),
            name(entry.attackerName),
            '→',
            name(entry.targetName)
        ];

        if (entry.value) {
            parts.push(String(entry.value));
        }

        parts.push(`(${name(entry.inflictorName)})`);

        if (entry.health) {
            parts.push(`hp=${entry.health}`);
        }

        console.log(parts.join(' '));
    });

    await parser.parse(reader);
    await parser.dispose();

    console.log(`Parsed [ ${counter} ] combat log events`);
})();

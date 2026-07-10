import { InterceptorStage, MessagePacketType, Parser, ParserConfiguration, StringTableType } from '@deademx/dota2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';

/**
 * @param {CMsgDOTACombatLogEntry} entry
 * @returns {Object<number, string>}
 */
function buildTypeLabels(entry) {
    const labels = {};
    const values = entry.$type.root.lookupEnum('DOTA_COMBATLOG_TYPES').valuesById;

    for (const [ id, label ] of Object.entries(values)) {
        labels[id] = label.replace('DOTA_COMBATLOG_', '');
    }

    return labels;
}

(async () => {
    const reader = await DemoProvider.resolve(DemoFile.DOTA2_REPLAY_8783006717);
    const parser = new Parser(new ParserConfiguration({ messagePacketTypes: [ MessagePacketType.DOTA_UM_COMBAT_LOG_DATA_HLTV ] }));

    let counter = 0;
    let typeLabels = null;

    parser.registerPostInterceptor(InterceptorStage.MESSAGE_PACKET, (demoPacket, messagePacket) => {
        if (messagePacket.type !== MessagePacketType.DOTA_UM_COMBAT_LOG_DATA_HLTV) {
            return;
        }

        const entry = messagePacket.data;

        counter += 1;

        typeLabels ??= buildTypeLabels(entry);

        const names = parser.getDemo().stringTableContainer.getByType(StringTableType.COMBAT_LOG_NAMES);
        const name = (id) => names?.getEntryById(id)?.key || `#${id}`;

        const parts = [
            `#${counter}`,
            `tick=${demoPacket.tick}`,
            `${(entry.timestamp ?? 0).toFixed(1)}s`,
            typeLabels[entry.type] ?? `TYPE_${entry.type}`,
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

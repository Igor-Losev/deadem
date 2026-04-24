import { Parser, ParserConfiguration, Printer } from '@deademx/dota2';

import DemoFile from '@deademx/examples-common/data/DemoFile.js';
import DemoProvider from '@deademx/examples-common/data/DemoProvider.js';
import Game from '@deademx/examples-common/data/Game.js';

const MATCHES_ARGUMENT_PREFIX = '--matches=';

(async () => {
    const matchesArgument = process.argv.find(arg => arg.startsWith(MATCHES_ARGUMENT_PREFIX));

    if (!matchesArgument) {
        console.error('Argument --matches is missing');

        process.exit(1);
    }

    const value = matchesArgument.slice(MATCHES_ARGUMENT_PREFIX.length);
    const demos = parseMatches(value);

    for (const demo of demos) {
        const reader = await DemoProvider.read(demo);
        const parser = new Parser(ParserConfiguration.DEFAULT);

        await parser.parse(reader);
        await parser.dispose();

        const printer = new Printer(parser);

        printer.printStats();
    }
})();

/**
 * @param {string} value
 * @returns {Array<DemoFile>}
 */
function parseMatches(value) {
    if (value.toLowerCase() === 'all') {
        return DemoFile.getAll().filter(demo => demo.game === Game.DOTA2 && demo.getFileName().endsWith('.dem'));
    }

    const demos = value
        .split(/[,\s]+/)
        .filter(Boolean)
        .map(match => match.replace(/-\S+$/, ''))
        .map(matchId => Number.parseInt(matchId, 10))
        .map(matchId => DemoFile.parse(matchId, Game.DOTA2));

    if (demos.length === 0 || demos.some(demo => demo === null)) {
        throw new Error('Argument --matches contains unknown matchId');
    }

    return demos;
}

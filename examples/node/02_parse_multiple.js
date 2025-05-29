import { Parser, Printer } from '#root/index.js';

import DemoFile from './helpers/DemoFile.js';
import DemoProvider from './helpers/DemoProvider.js';

(async () => {
    const matchesArgument = process.argv.find(arg => arg.startsWith('--matches='));

    if (!matchesArgument) {
        console.error('Argument --matches is missing');

        process.exit(1);
    }

    const value = matchesArgument.split('=')[1];

    let demos;

    if (value.toLowerCase() === 'all') {
        demos = DemoFile.getAll();
    } else {
        let delimiter;

        if (matchesArgument.includes(' ')) {
            delimiter = ' ';
        } else {
            delimiter = ',';
        }

        demos = matchesArgument.split('=')[1]
            .split(delimiter)
            .map(m => m.replace(/(\d{1,})(-\d{1,})/, (match, g1) => g1))
            .map(m => parseInt(m))
            .map(id => DemoFile.parse(id));

        if (demos.some(d => d === null)) {
            throw new Error('Argument --matches contains unknown matchId');
        }
    }

    for (let i = 0; i < demos.length; i++) {
        const demo = demos[i];

        const reader = await DemoProvider.read(demo);

        const parser = new Parser();
        const printer = new Printer(parser);

        await parser.parse(reader);

        printer.printStats();
    }
})();

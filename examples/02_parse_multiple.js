'use strict';

const Parser = require('./../src/Parser'),
    ParserConfiguration = require('./../src/ParserConfiguration');

const DemoFile = require('./helpers/DemoFile'),
    DemoProvider = require('./helpers/DemoProvider');

(async () => {
    const matchesArgument = process.argv.find(arg => arg.startsWith('--matches='));

    if (!matchesArgument) {
        console.error('Argument --matches is missing');

        process.exit(1);
    }

    let delimiter;

    if (matchesArgument.includes(' ')) {
        delimiter = ' ';
    } else {
        delimiter = ',';
    }

    const demos = matchesArgument.split('=')[1]
        .split(delimiter)
        .map(m => m.replace(/(\d{1,})(-\d{1,})/, (match, g1) => g1))
        .map(m => parseInt(m))
        .map(id => DemoFile.parse(id));

    if (demos.some(d => d === null)) {
        throw new Error(`Argument --matches contains unknown matchId`);
    }

    for (let i = 0; i < demos.length; i++) {
        const demo = demos[i];

        const reader = await DemoProvider.read(demo);

        const parser = new Parser();

        await parser.parse(reader);
    }
})();

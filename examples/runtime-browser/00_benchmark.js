import { Logger, Parser, ParserConfiguration } from '#root/index.js';

import Benchmark from '#root/examples/common/Benchmark.js';

const REPEATS = 10;

const state = {
    file: null,
    processing: false
};

const input = document.getElementById('input');
const output = document.getElementById('output');
const submit = document.getElementById('submit');

input.addEventListener('change', (event) => {
    state.file = event.target.files[0] || null;
});

submit.addEventListener('click', async () => {
    if (state.file === null || state.processing) {
        return;
    }

    state.processing = true;

    submit.setAttribute('disabled', '');

    const benchmark = new Benchmark();
    const configuration = new ParserConfiguration({ parserThreads: 4 });

    for (let i = 0; i < REPEATS; i++) {
        output.innerText = `Parsing #${i + 1}...`;

        const reader = state.file.stream();

        const parser = new Parser(configuration, Logger.NOOP);

        await benchmark.parse(parser, reader);

        await pause(100);
    }

    console.log(benchmark.getResult());

    output.innerText = 'Done';

    state.processing = false;

    submit.removeAttribute('disabled');
});

function pause(ms = 0) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

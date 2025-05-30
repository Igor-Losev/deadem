import { Readable } from 'readable-stream';

import { Logger, Parser, ParserConfiguration } from '#root/index.js';

import Benchmark from '#root/examples/common/Benchmark.js';

const REPEATS = 30;

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

    for (let i = 0; i < REPEATS; i++) {
        output.innerText = `Parsing #${i + 1}...`;

        const reader = getReadableFromFile(state.file);

        const parser = new Parser(ParserConfiguration.DEFAULT, Logger.NOOP);

        await benchmark.parse(parser, reader);

        await pause(100);
    }

    console.log(benchmark.getResult());

    output.innerText = 'Done';

    state.processing = false;

    submit.removeAttribute('disabled');
});

function getReadableFromFile(file) {
    const reader = file.stream().getReader();

    return new Readable({
        async read() {
            const { done, value } = await reader.read();

            if (done) {
                this.push(null);
            } else {
                this.push(value);
            }
        }
    });
}

function pause(ms = 0) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

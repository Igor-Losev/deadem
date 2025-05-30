import { Readable } from 'readable-stream';

import { Parser, Printer } from '#root/index.js';

const state = {
    file: null,
    processing: false
};

const input = document.getElementById('input');
const submit = document.getElementById('submit');

input.addEventListener('change', (event) => {
    state.file = event.target.files[0] || null;
});

submit.addEventListener('click', () => {
    if (state.file === null || state.processing) {
        return;
    }

    state.processing = true;

    submit.setAttribute('disabled', '');

    const reader = state.file.stream().getReader();

    const readable = new Readable({
        async read() {
            const { done, value } = await reader.read();

            if (done) {
                this.push(null);
            } else {
                this.push(value);
            }
        }
    });

    const parser = new Parser();
    const printer = new Printer(parser);

    parser.parse(readable)
        .then(() => {
            printer.printStats();

            state.processing = false;

            submit.removeAttribute('disabled');
        }).catch((error) => {
            console.error(error);

            state.processing = false;

            submit.removeAttribute('disabled');
        });
});

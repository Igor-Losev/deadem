import { Parser, ParserConfiguration, Printer } from '#root/index.js';

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

    const reader = state.file.stream();

    const configuration = new ParserConfiguration({ parserThreads: 4 });

    const parser = new Parser(configuration);
    const printer = new Printer(parser);

    parser.parse(reader)
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

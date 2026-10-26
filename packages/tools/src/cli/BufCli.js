import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

import Assert from '../core/Assert.js';

const require = createRequire(import.meta.url);

const BUF = require.resolve('@bufbuild/buf/bin/buf');
const PROTOC_GEN_ES = require.resolve('@bufbuild/protoc-gen-es/bin/protoc-gen-es');

const PROTOC_GEN_ES_OPTIONS = [ 'target=js+dts', 'import_extension=js' ];

class BufCli {
    /**
     * Generates descriptors and types with `protoc-gen-es`. Clears the output directory first.
     *
     * @public
     * @static
     * @param {string} input
     * @param {string} output
     * @param {Array<string>} types
     */
    static generate(input, output, types) {
        Assert.isTrue(types.length > 0, 'No types given: buf would generate every message of the input');

        const template = {
            version: 'v2',
            clean: true,
            plugins: [ { local: [ process.execPath, PROTOC_GEN_ES ], out: output, opt: PROTOC_GEN_ES_OPTIONS } ]
        };

        BufCli._run([ 'generate', input, '--template', JSON.stringify(template), ...types.flatMap(type => [ '--type', type ]) ]);
    }

    /**
     * @private
     * @static
     * @param {Array<string>} args
     */
    static _run(args) {
        const result = spawnSync(process.execPath, [ BUF, ...args ], { stdio: [ 'ignore', 'inherit', 'inherit' ] });

        if (result.error) {
            throw result.error;
        }

        if (result.status !== 0) {
            throw new Error(`buf ${args[0]} failed with status [ ${result.status} ] and signal [ ${result.signal} ]`);
        }
    }
}

export default BufCli;

import BufCli from '../../src/cli/BufCli.js';
import ScriptArguments from '../../src/cli/ScriptArguments.js';

import MessageRegistry from '../../src/proto/MessageRegistry.js';
import ProtoIndexWriter from '../../src/proto/ProtoIndexWriter.js';

const scriptArguments = new ScriptArguments(process.argv.slice(2));

(async () => {
    for (const workspace of scriptArguments.getWorkspaces()) {
        const types = await MessageRegistry.collect(workspace);

        const log = (message) => { console.log(`[ ${workspace.code} ]: ${message}`); };

        log(`Generating from [ ${types.length} ] registered messages...`);

        BufCli.generate(workspace.protoSourceDirectory, workspace.protoGeneratedDirectory, types);

        ProtoIndexWriter.write(workspace);
    }
})();

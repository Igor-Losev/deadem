import ScriptArguments from '../../src/cli/ScriptArguments.js';

import ProtoSource from '../../src/enums/ProtoSource.js';

import ProtoSync from '../../src/proto/ProtoSync.js';

const scriptArguments = new ScriptArguments(process.argv.slice(2));

(async () => {
    for (const workspace of scriptArguments.getWorkspaces()) {
        const source = ProtoSource.parseByWorkspace(workspace);

        console.log(`Syncing [ ${source.files.length} ] files of [ ${workspace.folder} ] from [ ${source.repository} ]...`);

        const changed = await new ProtoSync(source).run();

        changed.forEach(file => console.log(`Updated [ ${workspace.folder}/proto/source/${file} ]`));

        console.log(`Changed [ ${changed.length} ] of [ ${source.files.length} ] files`);
    }
})();

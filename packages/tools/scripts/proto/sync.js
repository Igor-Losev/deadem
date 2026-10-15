import ScriptArguments from '../../src/cli/ScriptArguments.js';

import ProtoSource from '../../src/enums/ProtoSource.js';

import ProtoSync from '../../src/proto/ProtoSync.js';

const scriptArguments = new ScriptArguments(process.argv.slice(2));

(async () => {
    for (const workspace of scriptArguments.getWorkspaces()) {
        const source = ProtoSource.parseByWorkspace(workspace);

        const log = (message) => { console.log(`[ ${workspace.code} ]: ${message}`); };

        log(`Syncing [ ${source.files.length} ] files from [ ${source.repository} ] ...`);

        const { changed, unlisted } = await new ProtoSync(source).run();

        changed.forEach(file => log(`Updated [ ${workspace.folder}/proto/source/${file} ]`));
        unlisted.forEach(file => log(`Imported [ ${file} ]: not in the file list`));

        if (changed.length === 0) {
            log('No changes found');
        } else {
            log(`Changed [ ${changed.length} ] files`);
        }
    }
})();

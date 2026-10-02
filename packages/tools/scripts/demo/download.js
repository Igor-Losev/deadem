import ScriptEnvironment from '../../src/cli/ScriptEnvironment.js';

import DemoFixtures from '../../src/demo/DemoFixtures.js';

const scriptEnvironment = new ScriptEnvironment(process.env);

(async () => {
    const fixtures = new DemoFixtures(scriptEnvironment.getValue('DEMO_FILES'));

    await fixtures.download(scriptEnvironment.getValue('DEMO_DIR'), scriptEnvironment.getValue('DEMO_CDN_PREFIX'));
})();

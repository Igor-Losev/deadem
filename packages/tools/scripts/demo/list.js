import ScriptEnvironment from '../../src/cli/ScriptEnvironment.js';

import DemoFixtures from '../../src/demo/DemoFixtures.js';

const scriptEnvironment = new ScriptEnvironment(process.env);
const fixtures = new DemoFixtures(scriptEnvironment.getValue('DEMO_FILES'));

console.log(fixtures.getMatches());

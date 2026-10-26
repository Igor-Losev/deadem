import loadLibraryModule from '#libraryLoader';

const PROJECT_DOCUMENTATION_URL = 'https://github.com/Igor-Losev/deadem/blob/main/README.md';

const SHARED_DESCRIPTION = 'Live demo of the deadem libraries, which parse and play back Source 2 replays of Deadlock, Dota 2 and Counter-Strike 2 in Node.js and browsers.';

export const LIBRARIES = [
  {
    key: 'deadlock',
    gameCode: 'deadlock',
    gameLabel: 'Deadlock',
    npmPackageName: '@deademx/deadlock',
    scriptFileName: 'deadem-deadlock.min.js',
    devImportSpecifier: '@deademx/deadlock',
    title: 'Deadem Explorer',
    description: SHARED_DESCRIPTION,
    documentationUrl: PROJECT_DOCUMENTATION_URL,
    npmUrl: 'https://www.npmjs.com/package/@deademx/deadlock',
    issuesUrl: 'https://github.com/Igor-Losev/deadem/issues',
    releasesUrl: 'https://github.com/Igor-Losev/deadem/releases'
  },
  {
    key: 'dota2',
    gameCode: 'dota2',
    gameLabel: 'Dota 2',
    npmPackageName: '@deademx/dota2',
    scriptFileName: 'deadem-dota2.min.js',
    devImportSpecifier: '@deademx/dota2',
    title: 'Deadem Explorer',
    description: SHARED_DESCRIPTION,
    documentationUrl: PROJECT_DOCUMENTATION_URL,
    npmUrl: 'https://www.npmjs.com/package/@deademx/dota2',
    issuesUrl: 'https://github.com/Igor-Losev/deadem/issues',
    releasesUrl: 'https://github.com/Igor-Losev/deadem/releases'
  },
  {
    key: 'cs2',
    gameCode: 'cs2',
    gameLabel: 'Counter-Strike 2',
    npmPackageName: '@deademx/cs2',
    scriptFileName: 'deadem-cs2.min.js',
    devImportSpecifier: '@deademx/cs2',
    title: 'Deadem Explorer',
    description: SHARED_DESCRIPTION,
    documentationUrl: PROJECT_DOCUMENTATION_URL,
    npmUrl: 'https://www.npmjs.com/package/@deademx/cs2',
    issuesUrl: 'https://github.com/Igor-Losev/deadem/issues',
    releasesUrl: 'https://github.com/Igor-Losev/deadem/releases'
  }
];

export function getLibraryByKey(key) {
  return LIBRARIES.find((library) => library.key === key) ?? null;
}

export { loadLibraryModule };

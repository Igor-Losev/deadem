import packageJson from './../package.json';

const loadedLibraryPromises = new Map();
const PROJECT_DOCUMENTATION_URL = 'https://github.com/Igor-Losev/deadem/blob/main/README.md';

export const LIBRARIES = [
  {
    key: 'deadlock',
    gameCode: 'deadlock',
    gameLabel: 'Deadlock',
    globalName: 'deadem',
    npmPackageName: 'deadem',
    scriptFileName: 'deadem.min.js',
    devImportSpecifier: 'deadem',
    title: 'Deadem Explorer',
    description: 'A web replay viewer powered by deadem for parsing and playing back Deadlock and Dota 2 demo files (.dem) in Node.js and the browser.',
    documentationUrl: PROJECT_DOCUMENTATION_URL,
    npmUrl: 'https://www.npmjs.com/package/deadem',
    issuesUrl: 'https://github.com/Igor-Losev/deadem/issues',
    releasesUrl: 'https://github.com/Igor-Losev/deadem/releases'
  },
  {
    key: 'dota2',
    gameCode: 'dota2',
    gameLabel: 'Dota 2',
    globalName: 'deademDota2',
    npmPackageName: '@deademx/dota2',
    scriptFileName: 'deadem-dota2.min.js',
    devImportSpecifier: '@deademx/dota2',
    title: 'Deadem Explorer',
    description: 'A web replay viewer powered by deadem for parsing and playing back Deadlock and Dota 2 demo files (.dem) in Node.js and the browser.',
    documentationUrl: PROJECT_DOCUMENTATION_URL,
    npmUrl: 'https://www.npmjs.com/package/@deademx/dota2',
    issuesUrl: 'https://github.com/Igor-Losev/deadem/issues',
    releasesUrl: 'https://github.com/Igor-Losev/deadem/releases'
  }
];

export function getLibraryByKey(key) {
  return LIBRARIES.find((library) => library.key === key) ?? LIBRARIES[0];
}

function getLibraryScriptUrl(library) {
  return `//cdn.jsdelivr.net/npm/${library.npmPackageName}@${packageJson.version}/dist/${library.scriptFileName}`;
}

function injectScript(library) {
  if (typeof window === 'undefined') {
    throw new Error('Window is unavailable');
  }

  const existingLibrary = window[library.globalName];

  if (existingLibrary) {
    return Promise.resolve(existingLibrary);
  }

  const existingPromise = loadedLibraryPromises.get(library.key);

  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');

    script.async = true;
    script.src = getLibraryScriptUrl(library);

    script.onload = () => {
      const runtimeLibrary = window[library.globalName];

      if (runtimeLibrary) {
        resolve(runtimeLibrary);
        return;
      }

      loadedLibraryPromises.delete(library.key);
      reject(new Error(`Global ${library.globalName} is unavailable after script load`));
    };

    script.onerror = () => {
      loadedLibraryPromises.delete(library.key);
      reject(new Error(`Failed to load ${library.npmPackageName} from CDN`));
    };

    document.head.appendChild(script);
  });

  loadedLibraryPromises.set(library.key, promise);

  return promise;
}

export async function loadLibraryModule(library) {
  if (import.meta.env.DEV) {
    switch (library.key) {
      case 'deadlock':
        return import('deadem');
      case 'dota2':
        return import('@deademx/dota2');
      default:
        throw new Error(`Unsupported library key: ${library.key}`);
    }
  }

  return injectScript(library);
}

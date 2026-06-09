import packageJson from './../../package.json';

const loadedLibraryPromises = new Map();

/**
 * @param {Object} library
 * @returns {Promise<Object>}
 */
export default function loadLibraryModule(library) {
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

  const promise = injectScript(library);

  loadedLibraryPromises.set(library.key, promise);

  return promise;
}

/**
 * @param {Object} library
 * @returns {Promise<Object>}
 */
function injectScript(library) {
  return new Promise((resolve, reject) => {
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
}

/**
 * @param {Object} library
 * @returns {string}
 */
function getLibraryScriptUrl(library) {
  return `//cdn.jsdelivr.net/npm/${library.npmPackageName}@${packageJson.version}/dist/${library.scriptFileName}`;
}

/**
 * @param {Object} library
 * @returns {Promise<Object>}
 */
export default function loadLibraryModule(library) {
  switch (library.key) {
    case 'deadlock':
      return import('deadem');
    case 'dota2':
      return import('@deademx/dota2');
    case 'cs2':
      return import('@deademx/cs2');
    default:
      throw new Error(`Unsupported library key: ${library.key}`);
  }
}

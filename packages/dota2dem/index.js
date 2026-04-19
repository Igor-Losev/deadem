import Bootstrap from './src/Bootstrap.js';

import ProtoProvider from '#providers/ProtoProvider.instance.js';

Bootstrap.run(ProtoProvider);

export * from '@deadem/engine';

export { default as Bootstrap } from './src/Bootstrap.js';
export { default as MessagePacketType } from './src/data/enums/MessagePacketType.js';
export { default as StringTableType } from './src/data/enums/StringTableType.js';

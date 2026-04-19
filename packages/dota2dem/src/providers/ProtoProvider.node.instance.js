import FileSystem from '@deadem/engine/src/core/FileSystem.js';

import ProtoProvider from './ProtoProvider.js';

const protoPath = FileSystem.getAbsolutePath(import.meta.url, './../../proto/compiled/proto.json');
const protoJson = FileSystem.readFileSync(protoPath, 'utf-8');

class ProtoProviderNode extends ProtoProvider {
    static instance = new ProtoProviderNode();

    constructor() {
        super(JSON.parse(protoJson));
    }
}

export default ProtoProviderNode.instance;

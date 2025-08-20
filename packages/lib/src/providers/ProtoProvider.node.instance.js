import protobuf from 'protobufjs';

import FileSystem from '#core/FileSystem.js';

import ProtoProvider from './ProtoProvider.js';

const protoPath = FileSystem.getAbsolutePath(import.meta.url, './../../proto/compiled/proto.json');
const protoJson = FileSystem.readFileSync(protoPath, 'utf-8');

const root = protobuf.Root.fromJSON(JSON.parse(protoJson));

class ProtoProviderNode extends ProtoProvider {
    static instance = new ProtoProviderNode();

    constructor() {
        super(root);
    }
}

export default ProtoProviderNode.instance;

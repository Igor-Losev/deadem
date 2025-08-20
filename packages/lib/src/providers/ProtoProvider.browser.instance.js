import protobuf from 'protobufjs';

import ProtoProvider from './ProtoProvider.js';

import protoJSON from './../../proto/compiled/proto.json';

const root = protobuf.Root.fromJSON(protoJSON);

class ProtoProviderBrowser extends ProtoProvider {
    static instance = new ProtoProviderBrowser();

    constructor() {
        super(root);
    }
}

export default ProtoProviderBrowser.instance;

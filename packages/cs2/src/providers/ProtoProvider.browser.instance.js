import ProtoProvider from './ProtoProvider.js';

import protoJSON from './../../proto/compiled/proto.json';

class ProtoProviderBrowser extends ProtoProvider {
    static instance = new ProtoProviderBrowser();

    constructor() {
        super(protoJSON);
    }
}

export default ProtoProviderBrowser.instance;

const path = require('path');

const protobuf = require('protobufjs');

const demo = protobuf.loadSync(path.resolve(__dirname, './../../proto/demo.proto'));
const netMessages = protobuf.loadSync(path.resolve(__dirname, './../../proto/netmessages.proto'))
const networkBaseTypes = protobuf.loadSync(path.resolve(__dirname, './../../proto/networkbasetypes.proto'));

class ProtoProvider {
    constructor() {

    }

    get DEMO() {
        return demo;
    }

    get NET_MESSAGES() {
        return netMessages;
    }

    get NETWORK_BASE_TYPES() {
        return networkBaseTypes;
    }

    static instance = new ProtoProvider();
}

module.exports = ProtoProvider.instance;

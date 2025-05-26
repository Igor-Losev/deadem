import protobuf from 'protobufjs';

import protoJSON from './../../proto/compiled/proto.json' with { type: 'json' };

const Root = protobuf.Root.fromJSON(protoJSON);

class ProtoProvider {
    constructor() {

    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get BASE_MODIFIER() {
        return Root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get CITADEL_GAME_EVENTS() {
        return Root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get CITADEL_USER_MESSAGES() {
        return Root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get DEMO() {
        return Root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get GAME_EVENTS() {
        return Root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get NET_MESSAGES() {
        return Root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get NETWORK_BASE_TYPES() {
        return Root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get TEMPORARY_ENTITIES() {
        return Root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get USER_MESSAGES() {
        return Root;
    }

    static instance = new ProtoProvider();
}

export default ProtoProvider.instance;

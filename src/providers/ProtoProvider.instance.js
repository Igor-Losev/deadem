'use strict';

const path = require('path');

const protobuf = require('protobufjs');

const Root = protobuf.loadSync(path.resolve(__dirname, './../../proto/compiled/proto.json'));

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

module.exports = ProtoProvider.instance;

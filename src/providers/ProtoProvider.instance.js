'use strict';

const path = require('path');

const protobuf = require('protobufjs');

const baseModifier = protobuf.loadSync(path.resolve(__dirname, './../../proto/base_modifier.proto'));
const citadelUserMessages = protobuf.loadSync(path.resolve(__dirname, './../../proto/citadel_usermessages.proto'));
const demo = protobuf.loadSync(path.resolve(__dirname, './../../proto/demo.proto'));
const gameEvents = protobuf.loadSync(path.resolve(__dirname, './../../proto/gameevents.proto'));
const netMessages = protobuf.loadSync(path.resolve(__dirname, './../../proto/netmessages.proto'))
const networkBaseTypes = protobuf.loadSync(path.resolve(__dirname, './../../proto/networkbasetypes.proto'));
const userMessages = protobuf.loadSync(path.resolve(__dirname, './../../proto/usermessages.proto'));

class ProtoProvider {
    constructor() {

    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get BASE_MODIFIER() {
        return baseModifier;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get CITADEL_USER_MESSAGES() {
        return citadelUserMessages;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get DEMO() {
        return demo;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get GAME_EVENTS() {
        return gameEvents;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get NET_MESSAGES() {
        return netMessages;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get NETWORK_BASE_TYPES() {
        return networkBaseTypes;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get USER_MESSAGES() {
        return userMessages;
    }

    static instance = new ProtoProvider();
}

module.exports = ProtoProvider.instance;

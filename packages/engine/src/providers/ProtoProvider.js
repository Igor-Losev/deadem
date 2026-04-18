import protobuf from 'protobufjs';

class ProtoProvider {
    /**
     * @public
     * @param {Object} schema
     */
    constructor(schema) {
        this._schema = schema;

        this._root = protobuf.Root.fromJSON(schema);
    }

    /**
     * @public
     * @returns {Object}
     */
    get schema() {
        return this._schema;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get DEMO() {
        return this._root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get GAME_EVENTS() {
        return this._root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get NET_MESSAGES() {
        return this._root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get NETWORK_BASE_TYPES() {
        return this._root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get TEMPORARY_ENTITIES() {
        return this._root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get USER_MESSAGES() {
        return this._root;
    }
}

export default ProtoProvider;

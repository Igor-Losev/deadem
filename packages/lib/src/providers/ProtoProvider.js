class ProtoProvider {
    /**
     * @public
     * @param {protobuf.Root} root
     */
    constructor(root) {
        this._root = root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get BASE_MODIFIER() {
        return this._root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get CITADEL_GAME_EVENTS() {
        return this._root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get CITADEL_USER_MESSAGES() {
        return this._root;
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

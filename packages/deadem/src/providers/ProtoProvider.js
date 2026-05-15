import { ProtoProvider as EngineProtoProvider } from '@deademx/engine';

class ProtoProvider extends EngineProtoProvider {
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
}

export default ProtoProvider;

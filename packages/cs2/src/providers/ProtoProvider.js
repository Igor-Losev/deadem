import { ProtoProvider as EngineProtoProvider } from '@deademx/engine';

class ProtoProvider extends EngineProtoProvider {
    /**
     * @public
     * @returns {protobuf.Root}
     */
    get CS_GAME_EVENTS() {
        return this._root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get CS_USER_MESSAGES() {
        return this._root;
    }
}

export default ProtoProvider;

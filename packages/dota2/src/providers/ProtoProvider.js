import { ProtoProvider as EngineProtoProvider } from '@deademx/engine';

class ProtoProvider extends EngineProtoProvider {
    /**
     * @public
     * @returns {protobuf.Root}
     */
    get DOTA_MODIFIERS() {
        return this._root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get DOTA_USER_MESSAGES() {
        return this._root;
    }

    /**
     * @public
     * @returns {protobuf.Root}
     */
    get ECON_ITEMS() {
        return this._root;
    }
}

export default ProtoProvider;

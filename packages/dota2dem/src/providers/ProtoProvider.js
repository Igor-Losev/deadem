import EngineProtoProvider from '@deadem/engine/src/providers/ProtoProvider.js';

class ProtoProvider extends EngineProtoProvider {
    /**
     * @public
     * @returns {protobuf.Root}
     */
    get DOTA_USER_MESSAGES() {
        return this._root;
    }
}

export default ProtoProvider;

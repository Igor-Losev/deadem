import { ProtoProvider as EngineProtoProvider } from '@deademx/engine';

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

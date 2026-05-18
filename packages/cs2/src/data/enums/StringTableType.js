import { StringTableType as EngineStringTableType } from '@deademx/engine';

class StringTableType extends EngineStringTableType {
    static get SERVER_AVATAR_OVERRIDES() { return serverAvatarOverrides; }
}

const serverAvatarOverrides = new StringTableType('SERVER_AVATAR_OVERRIDES', 'ServerAvatarOverrides');

export default StringTableType;

/** @import { StringTableRawValue } from '@deademx/engine' */

import { StringTableType as EngineStringTableType } from '@deademx/engine';

/**
 * @template {string} [C=string]
 * @template [D=*]
 * @extends {EngineStringTableType<C, D>}
 */
class StringTableType extends EngineStringTableType {
    /** @returns {EngineStringTableType<'SERVER_AVATAR_OVERRIDES', StringTableRawValue>} */
    static get SERVER_AVATAR_OVERRIDES() { return serverAvatarOverrides; }
}

const serverAvatarOverrides = new StringTableType('SERVER_AVATAR_OVERRIDES', 'ServerAvatarOverrides');

export default StringTableType;

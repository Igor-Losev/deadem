/** @import { StringTableRawValue } from '@deademx/engine' */
/** @import { CMsgPlayerInfo } from '@deademx/cs2/proto' */

import { StringTableType as EngineStringTableType } from '@deademx/engine';

/**
 * @template {string} [C=string]
 * @template [D=unknown]
 * @extends {EngineStringTableType<C, D>}
 */
class StringTableType extends EngineStringTableType {
    /** @returns {EngineStringTableType<'SERVER_AVATAR_OVERRIDES', StringTableRawValue>} */
    static get SERVER_AVATAR_OVERRIDES() { return serverAvatarOverrides; }
    /** @returns {EngineStringTableType<'USER_INFO', CMsgPlayerInfo|null>} */
    static get USER_INFO() { return userInfo; }
}

const serverAvatarOverrides = new StringTableType('SERVER_AVATAR_OVERRIDES', 'ServerAvatarOverrides');
const userInfo = new StringTableType('USER_INFO', 'userinfo', 'CMsgPlayerInfo');

export default StringTableType;

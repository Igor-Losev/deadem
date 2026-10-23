/** @import { StringTableRawValue } from '@deademx/engine' */
/** @import { CModifierTableEntry, CMsgPlayerInfo } from '@deademx/deadlock/proto' */

import { StringTableType as EngineStringTableType } from '@deademx/engine';

/**
 * @template {string} [C=string]
 * @template [D=unknown]
 * @extends {EngineStringTableType<C, D>}
 */
class StringTableType extends EngineStringTableType {
    /** @returns {EngineStringTableType<'ACTIVE_MODIFIERS', CModifierTableEntry|null>} */
    static get ACTIVE_MODIFIERS() { return activeModifiers; }
    /** @returns {EngineStringTableType<'COMBAT_LOG_NAMES', StringTableRawValue>} */
    static get COMBAT_LOG_NAMES() { return combatLogNames; }
    /** @returns {EngineStringTableType<'USER_INFO', CMsgPlayerInfo|null>} */
    static get USER_INFO() { return userInfo; }
}

const activeModifiers = new StringTableType('ACTIVE_MODIFIERS', 'ActiveModifiers', 'CModifierTableEntry', true);
const combatLogNames = new StringTableType('COMBAT_LOG_NAMES', 'CombatLogNames');
const userInfo = new StringTableType('USER_INFO', 'userinfo', 'CMsgPlayerInfo');

export default StringTableType;

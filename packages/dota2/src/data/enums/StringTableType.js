/** @import { StringTableRawValue } from '@deademx/engine' */
/** @import { CDOTAModifierBuffTableEntry, CSOEconItem } from '@deademx/dota2/proto' */

import { StringTableType as EngineStringTableType } from '@deademx/engine';

/**
 * @template {string} [C=string]
 * @template [D=*]
 * @extends {EngineStringTableType<C, D>}
 */
class StringTableType extends EngineStringTableType {
    /** @returns {EngineStringTableType<'ACTIVE_MODIFIERS', CDOTAModifierBuffTableEntry|null>} */
    static get ACTIVE_MODIFIERS() { return activeModifiers; }
    /** @returns {EngineStringTableType<'MODIFIER_NAMES', StringTableRawValue>} */
    static get MODIFIER_NAMES() { return modifierNames; }
    /** @returns {EngineStringTableType<'COOLDOWN_NAMES', StringTableRawValue>} */
    static get COOLDOWN_NAMES() { return cooldownNames; }
    /** @returns {EngineStringTableType<'ECON_ITEMS', CSOEconItem|null>} */
    static get ECON_ITEMS() { return econItems; }
    /** @returns {EngineStringTableType<'COMBAT_LOG_NAMES', StringTableRawValue>} */
    static get COMBAT_LOG_NAMES() { return combatLogNames; }
    /** @returns {EngineStringTableType<'LUA_MODIFIERS', StringTableRawValue>} */
    static get LUA_MODIFIERS() { return luaModifiers; }
    /** @returns {EngineStringTableType<'PARTICLE_ASSETS', StringTableRawValue>} */
    static get PARTICLE_ASSETS() { return particleAssets; }
    /** @returns {EngineStringTableType<'DOWNLOADABLES', StringTableRawValue>} */
    static get DOWNLOADABLES() { return downloadables; }
}

const activeModifiers = new StringTableType('ACTIVE_MODIFIERS', 'ActiveModifiers', 'CDOTAModifierBuffTableEntry', true);
const modifierNames = new StringTableType('MODIFIER_NAMES', 'ModifierNames');
const cooldownNames = new StringTableType('COOLDOWN_NAMES', 'CooldownNames');
const econItems = new StringTableType('ECON_ITEMS', 'EconItems', 'CSOEconItem');
const combatLogNames = new StringTableType('COMBAT_LOG_NAMES', 'CombatLogNames');
const luaModifiers = new StringTableType('LUA_MODIFIERS', 'LuaModifiers');
const particleAssets = new StringTableType('PARTICLE_ASSETS', 'ParticleAssets');
const downloadables = new StringTableType('DOWNLOADABLES', 'downloadables');

export default StringTableType;

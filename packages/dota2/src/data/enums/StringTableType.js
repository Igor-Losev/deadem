/** @import { StringTableRawValue } from '@deademx/engine' */

import { StringTableType as EngineStringTableType } from '@deademx/engine';

/**
 * @template {string} [C=string]
 * @template [D=*]
 * @extends {EngineStringTableType<C, D>}
 */
class StringTableType extends EngineStringTableType {
    /** @returns {StringTableType<'ACTIVE_MODIFIERS'>} */
    static get ACTIVE_MODIFIERS() { return activeModifiers; }
    /** @returns {StringTableType<'MODIFIER_NAMES', StringTableRawValue>} */
    static get MODIFIER_NAMES() { return modifierNames; }
    /** @returns {StringTableType<'COOLDOWN_NAMES', StringTableRawValue>} */
    static get COOLDOWN_NAMES() { return cooldownNames; }
    /** @returns {StringTableType<'ECON_ITEMS'>} */
    static get ECON_ITEMS() { return econItems; }
    /** @returns {StringTableType<'COMBAT_LOG_NAMES', StringTableRawValue>} */
    static get COMBAT_LOG_NAMES() { return combatLogNames; }
    /** @returns {StringTableType<'LUA_MODIFIERS', StringTableRawValue>} */
    static get LUA_MODIFIERS() { return luaModifiers; }
    /** @returns {StringTableType<'PARTICLE_ASSETS', StringTableRawValue>} */
    static get PARTICLE_ASSETS() { return particleAssets; }
    /** @returns {StringTableType<'DOWNLOADABLES', StringTableRawValue>} */
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

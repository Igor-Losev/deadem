import { StringTableType as EngineStringTableType } from '@deademx/engine';

class StringTableType extends EngineStringTableType {
    static get ACTIVE_MODIFIERS() { return activeModifiers; }
    static get MODIFIER_NAMES() { return modifierNames; }
    static get COOLDOWN_NAMES() { return cooldownNames; }
    static get ECON_ITEMS() { return econItems; }
    static get COMBAT_LOG_NAMES() { return combatLogNames; }
    static get LUA_MODIFIERS() { return luaModifiers; }
    static get PARTICLE_ASSETS() { return particleAssets; }
    static get DOWNLOADABLES() { return downloadables; }
    static get UNIT_NAMES() { return unitNames; }
}

const activeModifiers = new StringTableType('ACTIVE_MODIFIERS', 'ActiveModifiers', 'CDOTAModifierBuffTableEntry', true);
const modifierNames = new StringTableType('MODIFIER_NAMES', 'ModifierNames');
const cooldownNames = new StringTableType('COOLDOWN_NAMES', 'CooldownNames');
const econItems = new StringTableType('ECON_ITEMS', 'EconItems', 'CSOEconItem');
const combatLogNames = new StringTableType('COMBAT_LOG_NAMES', 'CombatLogNames');
const luaModifiers = new StringTableType('LUA_MODIFIERS', 'LuaModifiers');
const particleAssets = new StringTableType('PARTICLE_ASSETS', 'ParticleAssets');
const downloadables = new StringTableType('DOWNLOADABLES', 'downloadables');
const unitNames = new StringTableType('UNIT_NAMES', 'UnitNames');

export default StringTableType;

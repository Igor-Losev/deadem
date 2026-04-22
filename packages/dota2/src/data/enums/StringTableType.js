import EngineStringTableType from '@deademx/engine/src/data/enums/StringTableType.js';

class StringTableType extends EngineStringTableType {
    static get MODIFIER_NAMES() { return modifierNames; }
    static get COOLDOWN_NAMES() { return cooldownNames; }
    static get ECON_ITEMS() { return econItems; }
    static get COMBAT_LOG_NAMES() { return combatLogNames; }
    static get LUA_MODIFIERS() { return luaModifiers; }
    static get PARTICLE_ASSETS() { return particleAssets; }
}

const modifierNames = new StringTableType('MODIFIER_NAMES', 'ModifierNames');
const cooldownNames = new StringTableType('COOLDOWN_NAMES', 'CooldownNames');
const econItems = new StringTableType('ECON_ITEMS', 'EconItems');
const combatLogNames = new StringTableType('COMBAT_LOG_NAMES', 'CombatLogNames');
const luaModifiers = new StringTableType('LUA_MODIFIERS', 'LuaModifiers');
const particleAssets = new StringTableType('PARTICLE_ASSETS', 'ParticleAssets');

export default StringTableType;

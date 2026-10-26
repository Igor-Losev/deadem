import { StringTableType as EngineStringTableType } from '@deademx/engine';

class StringTableType extends EngineStringTableType {
    static get ACTIVE_MODIFIERS() { return activeModifiers; }
    static get COMBAT_LOG_NAMES() { return combatLogNames; }
}

const activeModifiers = new StringTableType('ACTIVE_MODIFIERS', 'ActiveModifiers', 'CModifierTableEntry', true);
const combatLogNames = new StringTableType('COMBAT_LOG_NAMES', 'CombatLogNames');

export default StringTableType;

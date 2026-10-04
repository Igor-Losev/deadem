import { StringTableType as EngineStringTableType } from '@deademx/engine';

/**
 * @template {string} [C=string]
 * @template [D=*]
 * @extends {EngineStringTableType<C, D>}
 */
class StringTableType extends EngineStringTableType {
    /** @returns {StringTableType<'ACTIVE_MODIFIERS'>} */
    static get ACTIVE_MODIFIERS() { return activeModifiers; }
}

const activeModifiers = new StringTableType('ACTIVE_MODIFIERS', 'ActiveModifiers', 'CModifierTableEntry', true);

export default StringTableType;

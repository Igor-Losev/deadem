import { StringTableType as EngineStringTableType } from '@deademx/engine';

class StringTableType extends EngineStringTableType {
    static get ACTIVE_MODIFIERS() { return activeModifiers; }
}

const activeModifiers = new StringTableType('ACTIVE_MODIFIERS', 'ActiveModifiers', false, true);

export default StringTableType;

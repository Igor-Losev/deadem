/** @import { SchemaRegistry } from '@deademx/engine' */

import { Bootstrap as EngineBootstrap, FieldDecoderDescriptor } from '@deademx/engine';

import EmbeddedMessageType from '../data/enums/EmbeddedMessageType.js';
import MessagePacketType from '../data/enums/MessagePacketType.js';
import StringTableType from '../data/enums/StringTableType.js';

/**
 * Populates a {@link SchemaRegistry} with the engine schema, Deadlock field rules, message packets, string tables and user commands.
 */
class Bootstrap {
    /**
     * @public
     * @static
     * @param {SchemaRegistry} registry
     */
    static run(registry) {
        EngineBootstrap.run(registry);

        Bootstrap._registerCitadelFieldRules(registry);
        Bootstrap._registerMessagePacketTypes(registry);
        Bootstrap._registerStringTableTypes(registry);
        Bootstrap._registerCitadelUserCommands(registry);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCitadelFieldRules(registry) {
        const fieldRules = registry.getFieldRuleRegistry();

        fieldRules.registerFieldTypeDecoder('HeroID_t', FieldDecoderDescriptor.VAR_UINT_32);
        fieldRules.registerFieldTypeDecoder('CUtlBinaryBlock', FieldDecoderDescriptor.BINARY_BLOCK);
        fieldRules.registerFieldTypeDecoder('NPC_STATE', FieldDecoderDescriptor.VAR_INT_32);
        fieldRules.registerFieldTypeDecoder('MatchID_t', FieldDecoderDescriptor.DYNAMIC_UINT_64);

        fieldRules.registerFieldDecoderOverride('m_iBonusClip', FieldDecoderDescriptor.VAR_UINT_32_MINUS_ONE);
        fieldRules.registerFieldDecoderOverride('m_iClip', FieldDecoderDescriptor.VAR_UINT_32_MINUS_ONE);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerMessagePacketTypes(registry) {
        for (const type of MessagePacketType.getAll()) {
            registry.registerMessageType(type);
        }
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerStringTableTypes(registry) {
        for (const type of StringTableType.getAll()) {
            registry.registerStringTableType(type);
        }
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCitadelUserCommands(registry) {
        registry.registerUserCommandType(EmbeddedMessageType.USER_COMMAND);
    }
}

export default Bootstrap;

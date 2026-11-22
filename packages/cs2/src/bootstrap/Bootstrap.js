/** @import { SchemaRegistry } from '@deademx/engine' */

import { Bootstrap as EngineBootstrap, FieldDecoderDescriptor } from '@deademx/engine';

import EmbeddedMessageType from '../data/enums/EmbeddedMessageType.js';
import MessagePacketType from '../data/enums/MessagePacketType.js';
import StringTableType from '../data/enums/StringTableType.js';

/**
 * Populates a {@link SchemaRegistry} with the engine schema, Counter-Strike 2 field rules, message packets, string tables and user commands.
 */
class Bootstrap {
    /**
     * @public
     * @static
     * @param {SchemaRegistry} registry
     */
    static run(registry) {
        EngineBootstrap.run(registry);

        Bootstrap._registerCs2FieldRules(registry);
        Bootstrap._registerMessagePacketTypes(registry);
        Bootstrap._registerStringTableTypes(registry);
        Bootstrap._registerCs2UserCommands(registry);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCs2FieldRules(registry) {
        const fieldRules = registry.getFieldRuleRegistry();

        fieldRules.registerFieldTypeDecoder('CUtlBinaryBlock', FieldDecoderDescriptor.BINARY_BLOCK);

        fieldRules.registerFixedTableType('CLightComponent');

        fieldRules.registerFieldDecoderOverride('m_iClip1', FieldDecoderDescriptor.VAR_UINT_32_MINUS_ONE);
        fieldRules.registerFieldDecoderOverride('m_iClip2', FieldDecoderDescriptor.VAR_UINT_32_MINUS_ONE);
        fieldRules.registerFieldDecoderOverride('m_pGameModeRules', FieldDecoderDescriptor.GAME_MODE_RULES);
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
    static _registerCs2UserCommands(registry) {
        registry.registerUserCommandType(EmbeddedMessageType.USER_COMMAND);
    }
}

export default Bootstrap;

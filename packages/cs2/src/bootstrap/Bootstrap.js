/** @import { SchemaRegistry } from '@deademx/engine' */

import { Bootstrap as EngineBootstrap, FieldDecoderDescriptor } from '@deademx/engine';

import EmbeddedMessageType from '../data/enums/EmbeddedMessageType.js';
import MessagePacketType from '../data/enums/MessagePacketType.js';
import StringTableType from '../data/enums/StringTableType.js';

/**
 * Populates a {@link SchemaRegistry} with engine-level types and then layers
 * Counter-Strike 2-specific user messages and game events on top.
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
        Bootstrap._registerCs2StringTableTypes(registry);
        Bootstrap._registerCs2UserCommands(registry);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCs2FieldRules(registry) {
        registry.registerFieldTypeDecoder('CGlobalSymbol', FieldDecoderDescriptor.STRING);
        registry.registerFieldTypeDecoder('CUtlBinaryBlock', FieldDecoderDescriptor.BINARY_BLOCK);
        registry.registerFieldTypeDecoder('Quaternion', FieldDecoderDescriptor.createVector(4));

        registry.registerFixedTableType('CLightComponent');

        registry.registerFieldDecoderOverride('m_pGameModeRules', FieldDecoderDescriptor.GAME_MODE_RULES);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerMessagePacketTypes(registry) {
        for (const type of MessagePacketType.getAll()) {
            if (type.protoName !== null) {
                registry.registerMessageType(type, registry.getDecoder(type.protoName));
            }
        }
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCs2StringTableTypes(registry) {
        registry.registerStringTableType(StringTableType.SERVER_AVATAR_OVERRIDES);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCs2UserCommands(registry) {
        registry.setUserCommandDecoder(registry.getDecoder(EmbeddedMessageType.USER_COMMAND.protoName));
    }
}

export default Bootstrap;

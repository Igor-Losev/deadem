/** @import { SchemaRegistry } from '@deademx/engine' */

import { Bootstrap as EngineBootstrap, FieldDecoderDescriptor } from '@deademx/engine';

import EmbeddedMessageType from '../data/enums/EmbeddedMessageType.js';
import MessagePacketType from '../data/enums/MessagePacketType.js';
import StringTableType from '../data/enums/StringTableType.js';

/**
 * Populates a {@link SchemaRegistry} with engine-level types and then layers
 * Deadlock-specific (Citadel) field rules, user messages, game events, and
 * string table types on top.
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
        Bootstrap._registerCitadelStringTableTypes(registry);
        Bootstrap._registerCitadelUserCommands(registry);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCitadelFieldRules(registry) {
        registry.registerFieldTypeDecoder('HeroID_t', FieldDecoderDescriptor.VAR_UINT_32);
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
    static _registerCitadelStringTableTypes(registry) {
        registry.registerStringTableType(StringTableType.ACTIVE_MODIFIERS);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCitadelUserCommands(registry) {
        registry.setUserCommandDecoder(registry.getDecoder(EmbeddedMessageType.USER_COMMAND.protoName));
    }
}

export default Bootstrap;

/** @import { SchemaRegistry } from '@deademx/engine' */

import { Bootstrap as EngineBootstrap, FieldDecoderDescriptor } from '@deademx/engine';

import MessagePacketType from '#data/enums/MessagePacketType.js';
import StringTableType from '#data/enums/StringTableType.js';

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
        const pp = registry.getProtoProvider();

        for (const type of MessagePacketType.getAll()) {
            if (type.protoName !== null) {
                registry.registerMessageType(type, pp.root.lookupType(type.protoName));
            }
        }

    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCitadelStringTableTypes(registry) {
        const pp = /** @type {import('./../providers/ProtoProvider.js').default} */ (registry.getProtoProvider());

        const modifierProto = pp.BASE_MODIFIER.lookupType('CModifierTableEntry');
        /** @type {(buffer: Uint8Array) => *} */
        const modifierDecoder = buffer => modifierProto.decode(buffer);

        registry.registerStringTableType(StringTableType.ACTIVE_MODIFIERS, modifierDecoder);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerCitadelUserCommands(registry) {
        const pp = registry.getProtoProvider();

        registry.setUserCommandDecoder(pp.NET_MESSAGES.lookupType('CCitadelUserCmdPB'));
    }
}

export default Bootstrap;

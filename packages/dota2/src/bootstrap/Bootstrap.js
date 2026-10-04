/** @import { SchemaRegistry } from '@deademx/engine' */

import { Bootstrap as EngineBootstrap, FieldDecoderDescriptor } from '@deademx/engine';

import MessagePacketType from '../data/enums/MessagePacketType.js';
import StringTableType from '../data/enums/StringTableType.js';

/**
 * Populates a {@link SchemaRegistry} with engine-level types and then layers
 * Dota 2-specific field rules, user messages, and string table types on top.
 */
class Bootstrap {
    /**
     * @public
     * @static
     * @param {SchemaRegistry} registry
     */
    static run(registry) {
        EngineBootstrap.run(registry);

        Bootstrap._registerDotaFieldRules(registry);
        Bootstrap._registerMessagePacketTypes(registry);
        Bootstrap._registerDotaStringTableTypes(registry);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerDotaFieldRules(registry) {
        registry.registerFieldTypeDecoder('HeroFacetKey_t', FieldDecoderDescriptor.DYNAMIC_UINT_64);
        registry.registerFieldTypeDecoder('HeroID_t', FieldDecoderDescriptor.VAR_INT_32);
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
    static _registerDotaStringTableTypes(registry) {
        const econItemsProto = registry.getDecoder('CSOEconItem');
        const modifierProto = registry.getDecoder('CDOTAModifierBuffTableEntry');

        /** @type {(buffer: Uint8Array) => *} */
        const econItemsDecoer = buffer => econItemsProto.decode(buffer);
        /** @type {(buffer: Uint8Array) => *} */
        const modifierDecoder = buffer => modifierProto.decode(buffer);

        registry.registerStringTableType(StringTableType.ACTIVE_MODIFIERS, modifierDecoder);
        registry.registerStringTableType(StringTableType.ECON_ITEMS, econItemsDecoer);
        registry.registerStringTableType(StringTableType.MODIFIER_NAMES);
        registry.registerStringTableType(StringTableType.COOLDOWN_NAMES);
        registry.registerStringTableType(StringTableType.ECON_ITEMS);
        registry.registerStringTableType(StringTableType.COMBAT_LOG_NAMES);
        registry.registerStringTableType(StringTableType.LUA_MODIFIERS);
        registry.registerStringTableType(StringTableType.PARTICLE_ASSETS);
        registry.registerStringTableType(StringTableType.DOWNLOADABLES);
    }
}

export default Bootstrap;

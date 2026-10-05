/** @import { SchemaRegistry } from '@deademx/engine' */

import { Bootstrap as EngineBootstrap, FieldDecoderDescriptor } from '@deademx/engine';

import MessagePacketType from '../data/enums/MessagePacketType.js';
import StringTableType from '../data/enums/StringTableType.js';

/**
 * Populates a {@link SchemaRegistry} with the engine schema, Dota 2 field rules, message packets and string tables.
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
        Bootstrap._registerStringTableTypes(registry);
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
}

export default Bootstrap;

/** @import SchemaRegistry from '../schema/SchemaRegistry.js' */

import DemoPacketType from '../data/enums/DemoPacketType.js';
import EmbeddedMessageType from '../data/enums/EmbeddedMessageType.js';

import FieldDecoderDescriptor from '../data/fields/decoding/FieldDecoderDescriptor.js';

/**
 * Populates a {@link SchemaRegistry} with demo packets, engine field rules and the send tables serializer.
 */
class Bootstrap {
    /**
     * @public
     * @static
     * @param {SchemaRegistry} registry
     */
    static run(registry) {
        Bootstrap._registerDemoPacketTypes(registry);
        Bootstrap._registerFieldRules(registry);

        registry.registerSendTablesSerializerType(EmbeddedMessageType.SEND_TABLES_SERIALIZER);
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerDemoPacketTypes(registry) {
        for (const type of DemoPacketType.getAll()) {
            registry.registerDemoType(type);
        }
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerFieldRules(registry) {
        const fieldRules = registry.getFieldRuleRegistry();

        fieldRules.registerFieldTypeDecoder('bool', FieldDecoderDescriptor.BOOLEAN);
        fieldRules.registerFieldTypeDecoder('CBodyComponent', FieldDecoderDescriptor.BOOLEAN);
        fieldRules.registerFieldTypeDecoder('CPhysicsComponent', FieldDecoderDescriptor.BOOLEAN);
        fieldRules.registerFieldTypeDecoder('CRenderComponent', FieldDecoderDescriptor.BOOLEAN);

        fieldRules.registerFieldTypeDecoder('GameTime_t', FieldDecoderDescriptor.NO_SCALE);

        fieldRules.registerFieldTypeDecoder('char', FieldDecoderDescriptor.STRING);
        fieldRules.registerFieldTypeDecoder('CUtlString', FieldDecoderDescriptor.STRING);
        fieldRules.registerFieldTypeDecoder('CUtlSymbolLarge', FieldDecoderDescriptor.STRING);
        fieldRules.registerFieldTypeDecoder('CGlobalSymbol', FieldDecoderDescriptor.STRING);

        fieldRules.registerFieldTypeDecoder('int8', FieldDecoderDescriptor.VAR_INT_32);
        fieldRules.registerFieldTypeDecoder('int16', FieldDecoderDescriptor.VAR_INT_32);
        fieldRules.registerFieldTypeDecoder('int32', FieldDecoderDescriptor.VAR_INT_32);
        fieldRules.registerFieldTypeDecoder('int64', FieldDecoderDescriptor.VAR_INT_64);

        fieldRules.registerFieldTypeDecoder('CEntityIndex', FieldDecoderDescriptor.VAR_INT_32);
        fieldRules.registerFieldTypeDecoder('CPlayerSlot', FieldDecoderDescriptor.VAR_INT_32);
        fieldRules.registerFieldTypeDecoder('GameTick_t', FieldDecoderDescriptor.VAR_INT_32);

        fieldRules.registerFieldTypeDecoder('HSequence', FieldDecoderDescriptor.VAR_UINT_32_MINUS_ONE);

        fieldRules.registerFieldTypeDecoder('float32', FieldDecoderDescriptor.DYNAMIC_FLOAT_32);

        fieldRules.registerFieldTypeDecoder('QAngle', FieldDecoderDescriptor.QANGLE);

        fieldRules.registerFieldTypeDecoder('CNetworkedQuantizedFloat', FieldDecoderDescriptor.QUANTIZED_FLOAT);

        fieldRules.registerFieldTypeDecoder('uint64', FieldDecoderDescriptor.DYNAMIC_UINT_64);
        fieldRules.registerFieldTypeDecoder('CStrongHandle', FieldDecoderDescriptor.DYNAMIC_UINT_64);
        fieldRules.registerFieldTypeDecoder('ResourceId_t', FieldDecoderDescriptor.DYNAMIC_UINT_64);

        fieldRules.registerFieldTypeDecoder('Vector2D', FieldDecoderDescriptor.createVector(2));
        fieldRules.registerFieldTypeDecoder('Vector', FieldDecoderDescriptor.createVector(3));
        fieldRules.registerFieldTypeDecoder('VectorWS', FieldDecoderDescriptor.createVector(3));
        fieldRules.registerFieldTypeDecoder('Vector4D', FieldDecoderDescriptor.createVector(4));
        fieldRules.registerFieldTypeDecoder('Quaternion', FieldDecoderDescriptor.createVector(4));
        fieldRules.registerFieldTypeDecoder('CTransform', FieldDecoderDescriptor.createVector(6));

        fieldRules.registerFixedTableType('CBodyComponent');
        fieldRules.registerFixedTableType('CEntityComponent');
        fieldRules.registerFixedTableType('CEntityIdentity');
        fieldRules.registerFixedTableType('CEntityInstance');
        fieldRules.registerFixedTableType('CPhysicsComponent');
        fieldRules.registerFixedTableType('CPlayerLocalData');
        fieldRules.registerFixedTableType('CRenderComponent');
        fieldRules.registerFixedTableType('CScriptComponent');

        fieldRules.registerVariableArrayType('CUtlVector');
        fieldRules.registerVariableArrayType('CUtlVectorEmbeddedNetworkVar');
        fieldRules.registerVariableArrayType('CNetworkUtlVectorBase');

        fieldRules.registerFieldEncoderOverride('m_flSimulationTime', 'simtime');
        fieldRules.registerFieldEncoderOverride('m_flAnimTime', 'simtime');
    }
}

export default Bootstrap;

/** @import SchemaRegistry from '../SchemaRegistry.js' */

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

        registry.setSendTablesSerializerDecoder(registry.getDecoder(EmbeddedMessageType.SEND_TABLES_SERIALIZER.protoName));
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerDemoPacketTypes(registry) {
        for (const type of DemoPacketType.getAll()) {
            if (type.protoName !== null) {
                registry.registerDemoType(type, registry.getDecoder(type.protoName));
            }
        }
    }

    /**
     * @protected
     * @static
     * @param {SchemaRegistry} registry
     */
    static _registerFieldRules(registry) {
        registry.registerFieldTypeDecoder('bool', FieldDecoderDescriptor.BOOLEAN);
        registry.registerFieldTypeDecoder('CBodyComponent', FieldDecoderDescriptor.BOOLEAN);
        registry.registerFieldTypeDecoder('CPhysicsComponent', FieldDecoderDescriptor.BOOLEAN);
        registry.registerFieldTypeDecoder('CRenderComponent', FieldDecoderDescriptor.BOOLEAN);

        registry.registerFieldTypeDecoder('GameTime_t', FieldDecoderDescriptor.NO_SCALE);

        registry.registerFieldTypeDecoder('char', FieldDecoderDescriptor.STRING);
        registry.registerFieldTypeDecoder('CUtlString', FieldDecoderDescriptor.STRING);
        registry.registerFieldTypeDecoder('CUtlSymbolLarge', FieldDecoderDescriptor.STRING);

        registry.registerFieldTypeDecoder('int8', FieldDecoderDescriptor.VAR_INT_32);
        registry.registerFieldTypeDecoder('int16', FieldDecoderDescriptor.VAR_INT_32);
        registry.registerFieldTypeDecoder('int32', FieldDecoderDescriptor.VAR_INT_32);
        registry.registerFieldTypeDecoder('int64', FieldDecoderDescriptor.VAR_INT_64);

        registry.registerFieldTypeDecoder('float32', FieldDecoderDescriptor.DYNAMIC_FLOAT_32);

        registry.registerFieldTypeDecoder('QAngle', FieldDecoderDescriptor.QANGLE);

        registry.registerFieldTypeDecoder('CNetworkedQuantizedFloat', FieldDecoderDescriptor.QUANTIZED_FLOAT);

        registry.registerFieldTypeDecoder('uint64', FieldDecoderDescriptor.DYNAMIC_UINT_64);
        registry.registerFieldTypeDecoder('CStrongHandle', FieldDecoderDescriptor.DYNAMIC_UINT_64);
        registry.registerFieldTypeDecoder('ResourceId_t', FieldDecoderDescriptor.DYNAMIC_UINT_64);

        registry.registerFieldTypeDecoder('Vector2D', FieldDecoderDescriptor.createVector(2));
        registry.registerFieldTypeDecoder('Vector', FieldDecoderDescriptor.createVector(3));
        registry.registerFieldTypeDecoder('VectorWS', FieldDecoderDescriptor.createVector(3));
        registry.registerFieldTypeDecoder('Vector4D', FieldDecoderDescriptor.createVector(4));

        registry.registerFixedTableType('CBodyComponent');
        registry.registerFixedTableType('CEntityComponent');
        registry.registerFixedTableType('CEntityIdentity');
        registry.registerFixedTableType('CEntityInstance');
        registry.registerFixedTableType('CPhysicsComponent');
        registry.registerFixedTableType('CPlayerLocalData');
        registry.registerFixedTableType('CRenderComponent');
        registry.registerFixedTableType('CScriptComponent');

        registry.registerVariableArrayType('CUtlVector');
        registry.registerVariableArrayType('CUtlVectorEmbeddedNetworkVar');
        registry.registerVariableArrayType('CNetworkUtlVectorBase');

        registry.registerFieldEncoderOverride('m_flSimulationTime', 'simtime');
        registry.registerFieldEncoderOverride('m_flAnimTime', 'simtime');
    }
}

export default Bootstrap;

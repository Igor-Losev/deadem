/** @import SchemaRegistry from '../SchemaRegistry.js' */

import DemoPacketType from '../data/enums/DemoPacketType.js';
import MessagePacketType from '../data/enums/MessagePacketType.js';
import StringTableType from '../data/enums/StringTableType.js';

import FieldDecoderDescriptor from '../data/fields/decoding/FieldDecoderDescriptor.js';

/**
 * Populates a {@link SchemaRegistry} with engine-level protobuf types
 * (demo packets, message packets, string table decoders, send tables serializer decoder).
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
        Bootstrap._registerMessagePacketTypes(registry);
        Bootstrap._registerStringTableTypes(registry);

        registry.setSendTablesSerializerDecoder(registry.getDecoder('CSVCMsg_FlattenedSerializer'));
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
    static _registerStringTableTypes(registry) {
        const userInfoProto = registry.getDecoder('CMsgPlayerInfo');

        registry.registerStringTableType(StringTableType.DECAL_PRE_CACHE);
        registry.registerStringTableType(StringTableType.EFFECT_DISPATCH);
        registry.registerStringTableType(StringTableType.ENTITY_NAMES);
        registry.registerStringTableType(StringTableType.GENERIC_PRE_CACHE);
        registry.registerStringTableType(StringTableType.INFO_PANEL);
        registry.registerStringTableType(StringTableType.INSTANCE_BASE_LINE);
        registry.registerStringTableType(StringTableType.LIGHT_STYLES);
        registry.registerStringTableType(StringTableType.RESPONSE_KEYS);
        registry.registerStringTableType(StringTableType.SCENES);
        registry.registerStringTableType(StringTableType.SERVER_QUERY_INFO);
        registry.registerStringTableType(StringTableType.USER_INFO, buffer => userInfoProto.decode(buffer));
        registry.registerStringTableType(StringTableType.V_GUI_SCREEN);
        registry.registerStringTableType(StringTableType.ANIM_TASK_TYPES);
        registry.registerStringTableType(StringTableType.ANIM_ASSET_DATA);
    }
}

export default Bootstrap;

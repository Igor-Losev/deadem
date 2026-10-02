import { create, createFileRegistry } from '@bufbuild/protobuf';
import { FieldDescriptorProto_Label, FieldDescriptorProto_Type, FileDescriptorProtoSchema, FileDescriptorSetSchema } from '@bufbuild/protobuf/wkt';

const SCALAR_TYPES = new Map([
    [ 'bool', FieldDescriptorProto_Type.BOOL ],
    [ 'bytes', FieldDescriptorProto_Type.BYTES ],
    [ 'double', FieldDescriptorProto_Type.DOUBLE ],
    [ 'fixed32', FieldDescriptorProto_Type.FIXED32 ],
    [ 'fixed64', FieldDescriptorProto_Type.FIXED64 ],
    [ 'float', FieldDescriptorProto_Type.FLOAT ],
    [ 'int32', FieldDescriptorProto_Type.INT32 ],
    [ 'int64', FieldDescriptorProto_Type.INT64 ],
    [ 'sint32', FieldDescriptorProto_Type.SINT32 ],
    [ 'sint64', FieldDescriptorProto_Type.SINT64 ],
    [ 'string', FieldDescriptorProto_Type.STRING ],
    [ 'uint32', FieldDescriptorProto_Type.UINT32 ],
    [ 'uint64', FieldDescriptorProto_Type.UINT64 ]
]);

/**
 * Descriptors of a proto2 test file, messages given as `[ name, number, type, repeated?, default? ]` field lists.
 *
 * @param {Record<string, Array<[ string, number, string, boolean?, string? ]>>} messages
 * @param {Record<string, Array<[ string, number ]>>} [enums={}]
 * @returns {import('@bufbuild/protobuf').FileRegistry}
 */
export default function createDescriptors(messages, enums = { }) {
    const file = create(FileDescriptorProtoSchema, {
        name: 'test.proto',
        syntax: 'proto2',
        enumType: Object.entries(enums).map(([ name, values ]) => ({
            name,
            value: values.map(([ valueName, number ]) => ({ name: valueName, number }))
        })),
        messageType: Object.entries(messages).map(([ name, fields ]) => ({
            name,
            field: fields.map(([ fieldName, number, type, repeated = false, defaultValue ]) => ({
                name: fieldName,
                number,
                label: repeated ? FieldDescriptorProto_Label.REPEATED : FieldDescriptorProto_Label.OPTIONAL,
                type: SCALAR_TYPES.get(type) ?? (type in enums ? FieldDescriptorProto_Type.ENUM : FieldDescriptorProto_Type.MESSAGE),
                typeName: SCALAR_TYPES.has(type) ? undefined : `.${type}`,
                defaultValue
            }))
        }))
    });

    return createFileRegistry(create(FileDescriptorSetSchema, { file: [ file ] }));
}

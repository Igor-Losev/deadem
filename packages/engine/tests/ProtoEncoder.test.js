import { create, createFileRegistry, toBinary } from '@bufbuild/protobuf';
import { FieldDescriptorProto_Label, FieldDescriptorProto_Type, FileDescriptorProtoSchema, FileDescriptorSetSchema } from '@bufbuild/protobuf/wkt';
import { describe, expect, test } from 'vitest';

import ProtoDecoder from '../src/core/proto/ProtoDecoder.js';
import ProtoEncoder from '../src/core/proto/ProtoEncoder.js';

import createDescriptors from './support/createDescriptors.js';

function createRegistry() {
    return createDescriptors({
        TestButtons: [
            [ 'press', 1, 'uint32' ],
            [ 'hold', 2, 'uint32' ]
        ],
        TestState: [
            [ 'tick', 1, 'int32' ],
            [ 'active', 2, 'bool' ],
            [ 'slot', 3, 'int32', false, '-1' ],
            [ 'ratio', 4, 'float' ],
            [ 'big', 5, 'uint64' ],
            [ 'buttons', 6, 'TestButtons' ],
            [ 'kind', 7, 'TestKind' ],
            [ 'entries', 8, 'TestButtons', true ],
            [ 'nums', 9, 'int32', true ],
            [ 'precise', 10, 'double' ],
            [ 'signed', 11, 'sint32' ],
            [ 'player_name', 12, 'string' ],
            [ 'blob', 13, 'bytes' ],
            [ 'wide', 14, 'sint64' ]
        ]
    }, {
        TestKind: [ [ 'KIND_A', 3 ], [ 'KIND_B', 7 ] ]
    });
}

function createPackedRegistry() {
    const file = create(FileDescriptorProtoSchema, {
        name: 'test.proto',
        syntax: 'proto2',
        messageType: [ {
            name: 'TestPacked',
            field: [ { name: 'nums', number: 1, label: FieldDescriptorProto_Label.REPEATED, type: FieldDescriptorProto_Type.INT32, options: { packed: true } } ]
        } ]
    });

    return createFileRegistry(create(FileDescriptorSetSchema, { file: [ file ] }));
}

describe('ProtoEncoder', () => {
    test('It should write back what ProtoDecoder read, byte for byte like protobuf-es', () => {
        const schema = createRegistry().getMessage('TestState');
        const bytes = toBinary(schema, create(schema, {
            tick: -1286,
            active: true,
            ratio: 1.5,
            big: 18446744073709551615n,
            buttons: { press: 1 },
            kind: 7,
            entries: [ { press: 2 }, { hold: 3 } ],
            nums: [ 1, -2, 3 ],
            precise: 0.25,
            signed: -5,
            playerName: 'ÿ player',
            blob: new Uint8Array([ 1, 2, 3 ]),
            wide: -9007199254740993n
        }));

        expect(ProtoEncoder.fromDescriptor(schema).encode(ProtoDecoder.fromDescriptor(schema).decode(bytes))).toEqual(bytes);
    });

    test('It should write only the fields the message holds, so the defaults stay out', () => {
        const schema = createRegistry().getMessage('TestState');
        const decoder = ProtoDecoder.fromDescriptor(schema);
        const encoder = ProtoEncoder.fromDescriptor(schema);
        const message = decoder.create();

        expect(encoder.encode(decoder.decode(new Uint8Array([ 0x08, 0x05 ])))).toEqual(new Uint8Array([ 0x08, 0x05 ]));
        expect(encoder.encode(message)).toEqual(new Uint8Array(0));

        message.slot = -1;

        expect(encoder.encode(message)).toEqual(new Uint8Array([ 0x18, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01 ]));
    });

    test('It should pack repeated scalars only when the field is packed', () => {
        expect(ProtoEncoder.fromDescriptor(createRegistry().getMessage('TestState')).encode({ nums: [ 1, 2 ] })).toEqual(new Uint8Array([ 0x48, 0x01, 0x48, 0x02 ]));
        expect(ProtoEncoder.fromDescriptor(createPackedRegistry().getMessage('TestPacked')).encode({ nums: [ 1, 2, 3 ] })).toEqual(new Uint8Array([ 0x0a, 0x03, 0x01, 0x02, 0x03 ]));
    });

    test('It should skip own fields without a value', () => {
        const encoder = ProtoEncoder.fromDescriptor(createRegistry().getMessage('TestState'));

        expect(encoder.encode({ tick: undefined, buttons: null, active: true })).toEqual(new Uint8Array([ 0x10, 0x01 ]));
    });

    test('It should return one encoder per descriptor and resolve nested encoders', () => {
        const schema = createRegistry().getMessage('TestState');
        const encoder = ProtoEncoder.fromDescriptor(schema);

        expect(ProtoEncoder.fromDescriptor(schema)).toBe(encoder);
        expect(encoder.getNestedEncoder(6).descriptor.typeName).toBe('TestButtons');
        expect(() => encoder.getNestedEncoder(1)).toThrow('Field [ 1 ] of [ TestState ] is not a message');
    });
});

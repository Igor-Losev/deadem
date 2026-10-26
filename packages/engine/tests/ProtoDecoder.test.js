import { create, createFileRegistry, equals, fromBinary, toBinary } from '@bufbuild/protobuf';
import { FieldDescriptorProto_Label, FieldDescriptorProto_Type, FileDescriptorProtoSchema, FileDescriptorSetSchema } from '@bufbuild/protobuf/wkt';
import { describe, expect, test } from 'vitest';

import ProtoDecoder from '../src/core/proto/ProtoDecoder.js';

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
        ],
        TestNode: [
            [ 'child', 1, 'TestNode' ]
        ]
    }, {
        TestKind: [ [ 'KIND_A', 3 ], [ 'KIND_B', 7 ] ]
    });
}

function createOneofRegistry() {
    const file = create(FileDescriptorProtoSchema, {
        name: 'test.proto',
        syntax: 'proto2',
        messageType: [ {
            name: 'TestChoice',
            field: [ { name: 'left', number: 1, label: FieldDescriptorProto_Label.OPTIONAL, type: FieldDescriptorProto_Type.INT32, oneofIndex: 0 } ],
            oneofDecl: [ { name: 'side' } ]
        } ]
    });

    return createFileRegistry(create(FileDescriptorSetSchema, { file: [ file ] }));
}

describe('ProtoDecoder', () => {
    test('It should decode every scalar kind, an enum, nested and repeated messages like protobuf-es', () => {
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

        const message = ProtoDecoder.fromDescriptor(schema).decode(bytes);

        expect(equals(schema, message, fromBinary(schema, bytes))).toBe(true);
        expect(message.$typeName).toBe('TestState');
        expect(message.big).toBe(18446744073709551615n);
        expect(message.wide).toBe(-9007199254740993n);
        expect(message.playerName).toBe('ÿ player');
        expect(message.entries[1].hold).toBe(3);
    });

    test('It should keep defaults on the prototype so that presence is visible', () => {
        const decoder = ProtoDecoder.fromDescriptor(createRegistry().getMessage('TestState'));
        const message = decoder.decode(new Uint8Array([ 0x08, 0x05 ]));

        expect(Object.keys(message)).toEqual([ 'tick' ]);
        expect(message.slot).toBe(-1);
        expect(message.kind).toBe(3);
        expect(message.big).toBe(0n);
        expect(message.buttons).toBeUndefined();
        expect(message.nums).toEqual([ ]);
        expect(Object.isFrozen(message.nums)).toBe(true);
        expect(Object.keys(decoder.create())).toEqual([ ]);
    });

    test('It should accept packed and unpacked repeated scalars', () => {
        const decoder = ProtoDecoder.fromDescriptor(createRegistry().getMessage('TestState'));

        expect(decoder.decode(new Uint8Array([ 0x4a, 0x03, 0x01, 0x02, 0x03, 0x48, 0x04 ])).nums).toEqual([ 1, 2, 3, 4 ]);
    });

    test('It should skip unknown fields and fields with an unexpected wire type', () => {
        const decoder = ProtoDecoder.fromDescriptor(createRegistry().getMessage('TestState'));
        const message = decoder.decode(new Uint8Array([ 0xf8, 0x01, 0x07, 0x0a, 0x01, 0x00, 0x10, 0x01 ]));

        expect(Object.keys(message)).toEqual([ 'active' ]);
        expect(message.tick).toBe(0);
    });

    test('It should return one decoder per descriptor and resolve nested decoders', () => {
        const schema = createRegistry().getMessage('TestState');
        const decoder = ProtoDecoder.fromDescriptor(schema);

        expect(ProtoDecoder.fromDescriptor(schema)).toBe(decoder);
        expect(decoder.getField(6).message.typeName).toBe('TestButtons');
        expect(decoder.getNestedDecoder(6).create().$typeName).toBe('TestButtons');
        expect(decoder.getField(99)).toBeNull();
    });

    test('It should stop at the recursion limit', () => {
        const decoder = ProtoDecoder.fromDescriptor(createRegistry().getMessage('TestNode'));

        let bytes = [ ];

        for (let i = 0; i < 70; i++) {
            const length = [ ];

            for (let value = bytes.length; ; value >>>= 7) {
                length.push(value < 0x80 ? value : (value & 0x7f) | 0x80);

                if (value < 0x80) {
                    break;
                }
            }

            bytes = [ 0x0a, ...length, ...bytes ];
        }

        expect(() => decoder.decode(new Uint8Array(bytes))).toThrow('Unexpected message depth [ 65 ]');
    });

    test('It should reject oneof fields', () => {
        expect(() => new ProtoDecoder(createOneofRegistry().getMessage('TestChoice'))).toThrow('Unsupported oneof field [ TestChoice.left ]');
    });
});

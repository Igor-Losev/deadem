'use strict';

const assert = require('node:assert/strict');

const FieldModel = require('./../enums/FieldModel');

const FieldDecoderInstructions = require('./FieldDecoderInstructions'),
    FieldDecoderPicker = require('./FieldDecoderPicker.instance'),
    FieldDefinition = require('./FieldDefinition');

class Field {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {FieldDefinition} definition
     * @param {Array<String>} sendNode
     * @param {FieldDecoderInstructions} decoderInstructions
     * @param {Serializer|null} serializer
     */
    constructor(
        name,
        definition,
        sendNode,
        decoderInstructions,
        serializer
    ) {
        assert(typeof name === 'string');
        assert(definition instanceof FieldDefinition);
        assert(Array.isArray(sendNode) && sendNode.every(s => s.length > 0));
        assert(decoderInstructions instanceof FieldDecoderInstructions);

        this._name = name;
        this._definition = definition;
        this._sendNode = sendNode;
        this._decoderInstructions = decoderInstructions;
        this._serializer = serializer || null;

        this._decoder = null;
        this._decoderBase = null;
        this._decoderChild = null;

        const model = classify.call(this);

        this._changeModel(model);
    }

    /**
     * @returns {FieldDecoderInstructions}
     */
    get decoderInstructions() {
        return this._decoderInstructions;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {Number} index
     * @returns {FieldDecoder}
     */
    getDecoderForFieldPath(fieldPath, index = 0) {
        switch (this._model) {
            case FieldModel.ARRAY_FIXED:
                return this._decoder;
            case FieldModel.ARRAY_VARIABLE:
                if (fieldPath.length - 1 === index) {
                    return this._decoderChild;
                }

                return this._decoderBase;
            case FieldModel.SIMPLE:
                return this._decoder;
            case FieldModel.TABLE_FIXED:
                if (fieldPath.length === index) {
                    return this._decoderBase;
                }

                return this._serializer.getDecoderForFieldPath(fieldPath, index);
            case FieldModel.TABLE_VARIABLE:
                if (fieldPath.length - 1 >= index + 1) {
                    return this._serializer.getDecoderForFieldPath(fieldPath, index + 1);
                }

                return this._decoderBase;
            default:
                throw new Error(`Unhandled model [ ${this._model} ]`);
        }
    }

    /**
     * @protected
     * @param {FieldModel} model
     */
    _changeModel(model) {
        assert(model instanceof FieldModel);

        switch (model) {
            case FieldModel.ARRAY_FIXED:
                this._decoder = getDecoder.call(this);

                break;
            case FieldModel.ARRAY_VARIABLE:
                if (this._definition.generic === null) {
                    throw new Error(`Field with a model of ARRAY_VARIABLE doesn't have a generic. This should never happen`);
                }

                this._decoderBase = FieldDecoderPicker.getUVarInt32();
                this._decoderChild = getDecoder.call(this, true);

                break;
            case FieldModel.SIMPLE:
                this._decoder = getDecoder.call(this);

                break;
            case FieldModel.TABLE_FIXED:
                this._decoderBase = FieldDecoderPicker.getBoolean();

                break;
            case FieldModel.TABLE_VARIABLE:
                this._decoderBase = FieldDecoderPicker.getUVarInt32();

                break;
        }

        this._model = model;
    }
}

function classify() {
    let model;

    if (this._serializer !== null) {
        if (this._definition.pointer || [
            'CBodyComponent',
            'CEntityComponent',
            'CEntityIdentity',
            'CEntityInstance',
            'CPhysicsComponent',
            'CRenderComponent',
            'CScriptComponent'
        ].includes(this._definition.baseType)) {
            model = FieldModel.TABLE_FIXED;
        } else {
            model = FieldModel.TABLE_VARIABLE;
        }
    } else if (this._definition.count > 0 && this._definition.baseType !== 'char') {
        model = FieldModel.ARRAY_FIXED;
    } else if ([ 'CUtlVector', 'CUtlVectorEmbeddedNetworkVar', 'CNetworkUtlVectorBase' ].includes(this._definition.baseType)) {
        model = FieldModel.ARRAY_VARIABLE;
    } else {
        model = FieldModel.SIMPLE;
    }

    return model;
}

function getDecoder(generic = false) {
    let baseType;

    if (generic) {
        baseType = this._definition.generic.baseType;
    } else {
        baseType = this._definition.baseType;
    }

    return FieldDecoderPicker.pick(baseType, this);
}

module.exports = Field;

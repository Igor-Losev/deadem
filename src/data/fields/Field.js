import Assert from '#core/Assert.js';

import FieldModel from '#data/enums/FieldModel.js';

import FieldDecoderInstructions from './FieldDecoderInstructions.js';
import FieldDecoderPicker from './FieldDecoderPicker.instance.js';
import FieldDefinition from './FieldDefinition.js';

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
        Assert.isTrue(typeof name === 'string');
        Assert.isTrue(definition instanceof FieldDefinition);
        Assert.isTrue(Array.isArray(sendNode) && sendNode.every(s => s.length > 0));
        Assert.isTrue(decoderInstructions instanceof FieldDecoderInstructions);

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
     * @param {number} index
     * @returns {FieldDecoder}
     */
    getDecoderForFieldPath(fieldPath, index = 0) {
        let decoder;

        switch (this._model) {
            case FieldModel.ARRAY_FIXED:
                decoder = this._decoder;

                break;
            case FieldModel.ARRAY_VARIABLE:
                if (fieldPath.length - 1 === index) {
                    decoder = this._decoderChild;
                } else {
                    decoder = this._decoderBase;
                }

                break;
            case FieldModel.SIMPLE:
                decoder = this._decoder;

                break;
            case FieldModel.TABLE_FIXED:
                if (fieldPath.length === index) {
                    decoder = this._decoderBase;
                } else {
                    decoder = this._serializer.getDecoderForFieldPath(fieldPath, index);
                }

                break;
            case FieldModel.TABLE_VARIABLE:
                if (fieldPath.length - 1 >= index + 1) {
                    decoder = this._serializer.getDecoderForFieldPath(fieldPath, index + 1);
                } else {
                    decoder = this._decoderBase;
                }

                break;
            default:
                throw new Error(`Unhandled model [ ${this._model} ]`);
        }

        return decoder;
    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {string}
     */
    getNameForFieldPath(fieldPath, index = 0) {
        const parts = [ this._name ];

        switch (this._model) {
            case FieldModel.ARRAY_FIXED:
                if (fieldPath.length - 1 === index) {
                    const arrayIndex = fieldPath.get(index);

                    parts.push(String(arrayIndex).padStart(4, '0'));
                }

                break;
            case FieldModel.ARRAY_VARIABLE:
                if (fieldPath.length - 1 === index) {
                    const arrayIndex = fieldPath.get(index);

                    parts.push(String(arrayIndex).padStart(4, '0'));
                }

                break;
            case FieldModel.SIMPLE:
                break;
            case FieldModel.TABLE_FIXED:
                if (fieldPath.length - 1 >= index) {
                    parts.push(this._serializer.getNameForFieldPath(fieldPath, index));
                }

                break;
            case FieldModel.TABLE_VARIABLE:
                if (fieldPath.length - 1 !== index - 1) {
                    const tableIndex = fieldPath.get(index);

                    parts.push(String(tableIndex).padStart(4, '0'));

                    if (fieldPath.length - 1 !== index) {
                        parts.push(this._serializer.getNameForFieldPath(fieldPath, index + 1));
                    }
                }

                break;
            default:
                throw new Error(`Unhandled model [ ${this._model} ]`);
        }

        return parts.join('.');
    }

    /**
     * @protected
     * @param {FieldModel} model
     */
    _changeModel(model) {
        Assert.isTrue(model instanceof FieldModel);

        switch (model) {
            case FieldModel.ARRAY_FIXED:
                this._decoder = getDecoder.call(this);

                break;
            case FieldModel.ARRAY_VARIABLE:
                if (this._definition.generic === null) {
                    throw new Error('Field with a model of ARRAY_VARIABLE doesn\'t have a generic. This should never happen');
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

export default Field;

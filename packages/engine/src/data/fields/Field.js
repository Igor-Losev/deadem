import Assert from '#core/Assert.js';

class Field {
    /**
     * @public
     * @constructor
     * @param {String} name
     * @param {Array<String>} sendNode
     */
    constructor(name, sendNode) {
        Assert.isTrue(typeof name === 'string');
        Assert.isTrue(Array.isArray(sendNode) && sendNode.every(s => s.length > 0));

        this._name = name;
        this._sendNode = sendNode;
    }

    /**
     * @public
     * @returns {FieldModel}
     */
    get model() {
        throw new Error('Abstract: get model()');
    }

    /**
     * @public
     * @returns {String}
     */
    get name() {
        return this._name;
    }

    /**
     * @public
     * @returns {Array<String>}
     */
    get sendNode() {
        return this._sendNode;
    }

    /**
     * @abstract
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {Function}
     */
    getDecoderForFieldPath() {
        throw new Error('Abstract: getDecoderForFieldPath()');
    }

    /**
     * @abstract
     * @public
     * @param {FieldPath} fieldPath
     * @param {number} index
     * @returns {FieldStorageDescriptor}
     */
    getStorageForFieldPath() {
        throw new Error('Abstract: getStorageForFieldPath()');
    }

    /**
     * @abstract
     * @public
     * @returns {String}
     */
    getNameForFieldPath() {
        throw new Error('Abstract: getNameForFieldPath()');
    }
}

export default Field;

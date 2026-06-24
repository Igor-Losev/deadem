/** @import FieldPath from '#data/fields/path/FieldPath.js' */

import Assert from '#core/Assert.js';

import FieldPathBuilder from '#data/fields/path/FieldPathBuilder.js';

/**
 * Stateful cursor that combines a path builder with a raw value reader.
 * Each {@link Field} receives one extractor positioned at its own base slot
 * and navigates deeper through {@link #enter} / {@link #exit}.
 */
class FieldExtractor {
    /**
     * @public
     * @constructor
     * @param {function(FieldPath): *} readField
     * @param {Array<number>} basePath
     */
    constructor(readField, basePath) {
        Assert.isTrue(typeof readField === 'function');
        Assert.isTrue(Array.isArray(basePath) && basePath.length > 0);

        this._readField = readField;
        this._builder = new FieldPathBuilder();

        this._builder.set(basePath[0], 0);

        for (let i = 1; i < basePath.length; i++) {
            this._builder.push(basePath[i]);
        }
    }

    /**
     * Shortcut for reading a single leaf one level below: enter → read → exit.
     *
     * @public
     * @param {number} index
     * @returns {*}
     */
    at(index) {
        this.enter(index);

        const value = this.read();

        this.exit();

        return value;
    }

    /**
     * Descends one level deeper.
     *
     * @public
     * @param {number} index
     */
    enter(index) {
        this._builder.push(index);
    }

    /**
     * Ascends one level back.
     *
     * @public
     */
    exit() {
        this._builder.drop(1);
    }

    /**
     * Reads the value at the current builder position.
     *
     * @public
     * @returns {*}
     */
    read() {
        return this._readField(this._builder.build());
    }
}

export default FieldExtractor;

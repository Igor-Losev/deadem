/** @import ConsoleCommandType from './enums/ConsoleCommandType.js' */

import Assert from '../core/Assert.js';

class ConsoleCommand {
    /** @private @type {string} */
    _text;

    /** @private @type {ConsoleCommandType} */
    _type;

    /**
     * @public
     * @constructor
     * @param {ConsoleCommandType} type
     * @param {string} text
     */
    constructor(type, text) {
        Assert.exists(type, 'Invalid type: expected a ConsoleCommandType');
        Assert.isTrue(typeof text === 'string' && text.length > 0, 'Invalid text: expected a non-empty string');

        this._type = type;
        this._text = text;
    }

    /**
     * @public
     * @returns {string}
     */
    get text() {
        return this._text;
    }

    /**
     * @public
     * @returns {ConsoleCommandType}
     */
    get type() {
        return this._type;
    }
}

export default ConsoleCommand;

import Assert from '../core/Assert.js';

/**
 * Environment variables of the tools scripts.
 */
class ScriptEnvironment {
    /**
     * @constructor
     * @param {Object<string, string|undefined>} values
     */
    constructor(values) {
        Assert.isTrue(typeof values === 'object' && values !== null);

        /** @private */
        this._values = values;
    }

    /**
     * Value of the [name] variable; fails when it is missing or empty.
     *
     * @public
     * @param {string} name
     * @returns {string}
     */
    getValue(name) {
        const value = this._values[name] || '';

        if (value.length === 0) {
            throw new Error(`Environment variable [ ${name} ] is missing`);
        }

        return value;
    }
}

export default ScriptEnvironment;

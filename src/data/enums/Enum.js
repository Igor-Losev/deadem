class Enum {
    /**
     * @abstract
     * @constructor
     * @param {String} code
     * @param {String} description
     */
    constructor(code, description) {
        this._code = code;
        this._description = description;
    }

    get code() {
        return this._code;
    }

    get description() {
        return this._description;
    }
}

module.exports = Enum;

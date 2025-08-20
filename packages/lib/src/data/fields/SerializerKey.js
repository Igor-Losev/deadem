import Assert from '#core/Assert.js';

class SerializerKey {
    constructor(name, version) {
        Assert.isTrue(typeof name === 'string');
        Assert.isTrue(Number.isInteger(version));

        this._name = name;
        this._version = version;
    }

    get name() {
        return this._name;
    }

    get version() {
        return this._version;
    }

    /**
     * @public
     * @returns {String}
     */
    toString() {
        return `${this._name}|${this._version}`;
    }
}

export default SerializerKey;

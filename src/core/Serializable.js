class Serializable {
    /**
     * @public
     * @abstract
     */
    constructor() {
        const DerivedClass = this.constructor;

        if (typeof DerivedClass.deserialize !== 'function') {
            throw new Error(`${DerivedClass.name} must implement static method deserialize()`);
        }
    }

    /**
     * @public
     */
    serialize() {
        return this._serialize();
    }

    /**
     * @protected
     */
    _serialize() {
        throw new Error(`serialize() method is not implemented`);
    }
}

export default Serializable;

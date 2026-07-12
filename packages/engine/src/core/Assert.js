class Assert {
    /**
     * @public
     * @static
     * @template T
     * @param {T} value
     * @param {string=} message
     * @returns {asserts value is NonNullable<T>}
     */
    static exists(value, message = 'Value must not be null or undefined') {
        if (value === null || value === undefined) {
            throw new Error(message);
        }
    }

    /**
     * @public
     * @static
     * @param {boolean} condition
     * @param {string=} message
     * @returns {asserts condition}
     */
    static isTrue(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
    }
}

export default Assert;

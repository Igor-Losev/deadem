class Assert {
    /**
     * @public
     * @static
     * @param {boolean} condition
     * @param {string=} message
     */
    static isTrue(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
    }
}

export default Assert;

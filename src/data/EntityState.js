'use strict';

class EntityState extends Array {
    constructor(...args) {
        super(...args);
    }

    getValue() {

    }

    /**
     * @public
     * @param {FieldPath} fieldPath
     * @param {*} value
     */
    setValue(fieldPath, value) {
        let state = this;

        for (let i = 0; i < fieldPath.length; i++) {
            const index = fieldPath.get(i);

            const isLast = i === fieldPath.length - 1;

            if (isLast) {
                state[index] = value;

                return;
            }

            state[index] = new EntityState();

            state = state[index];
        }
    }
}

module.exports = EntityState;

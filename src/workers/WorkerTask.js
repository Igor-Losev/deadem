'use strict';

const WorkerTaskType = require('../data/enums/WorkerTaskType');

class WorkerTask {
    /**
     * @constructor
     *
     * @param {WorkerTaskType} type
     * @param {number} id
     * @param {*} data
     * @param {Array<Transferable>=} transfers
     */
    constructor(type, id, data, transfers = [ ]) {
        this._type = type;
        this._id = id;
        this._data = data;
        this._transfers = transfers;
    }

    get type() {
        return this._type;
    }

    get id() {
        return this._id;
    }

    get data() {
        return this._data;
    }

    get transfers() {
        return this._transfers;
    }

    toObject() {
        return {
            type: this._type.code,
            id: this._id,
            data: this._data
        };
    }

    static fromObject(object) {
        const type = WorkerTaskType.parse(object.type);

        if (type === null) {
            throw new Error(`Unknown type [ ${object.type} ]`);
        }

        return new WorkerTask(type, object.id, object.data);
    }
}

module.exports = WorkerTask;

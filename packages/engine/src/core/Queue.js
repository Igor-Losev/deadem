class Queue {
    /**
     * @constructor
     */
    constructor() {
        this._head = null;
        this._tail = null;

        this._size = 0;
    }

    /**
     * @public
     * @returns {number}
     */
    get size() {
        return this._size;
    }

    /**
     * @public
     * @param {*} data
     */
    enqueue(data) {
        const queueItem = new QueueItem(data);

        if (this._size === 0) {
            this._head = queueItem;
            this._tail = queueItem;
        } else {
            this._tail.next = queueItem;

            queueItem.previous = this._tail;

            this._tail = queueItem;
        }

        this._size++;
    }

    /**
     * @public
     * @returns {*}
     */
    dequeue() {
        if (this._size === 0) {
            throw new Error(`Unable to dequeue - queue size is [ ${this._size} ]`);
        }

        const queueItem = this._head;

        if (this._size === 1) {
            this._head = null;
            this._tail = null;
        } else {
            const next = queueItem.next;

            next.previous = null;

            this._head = next;
        }

        this._size--;

        return queueItem.data;
    }
}

class QueueItem {
    /**
     * @constructor
     * @param {*} data
     */
    constructor(data) {
        this.data = data;

        this.next = null;
        this.previous = null;
    }
}

export default Queue;


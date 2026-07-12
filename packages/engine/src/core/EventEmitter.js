import Assert from '#core/Assert.js';

/**
 * @typedef {(sender: *, ...args: Array<*>) => void} EventEmitterHandler
 */

class EventEmitter {
    /**
     * @constructor
     * @param {*} sender
     */
    constructor(sender) {
        this._sender = sender;

        /** @type {Map<string, Array<EventEmitterHandler>>} */
        this._registrations = new Map();
    }

    /**
     * @public
     */
    clear() {
        this._registrations.clear();
    }

    /**
     * @public
     * @param {string} eventName
     * @param {...*} args
     */
    fire(eventName, ...args) {
        Assert.isTrue(typeof eventName === 'string');

        const registrations = this._registrations.get(eventName) || [ ];

        for (const registration of registrations) {
            registration(this._sender, ...args);
        }
    }

    /**
     * @public
     * @param {string} eventName
     * @param {EventEmitterHandler} handler
     */
    register(eventName, handler) {
        Assert.isTrue(typeof eventName === 'string');
        Assert.isTrue(typeof handler === 'function');

        const registrations = this._registrations.get(eventName) || [ ];

        registrations.push(handler);

        this._registrations.set(eventName, registrations);
    }

    /**
     * @public
     * @param {string} eventName
     * @param {EventEmitterHandler} handler
     * @returns {boolean}
     */
    unregister(eventName, handler) {
        Assert.isTrue(typeof eventName === 'string');
        Assert.isTrue(typeof handler === 'function');

        const registrations = this._registrations.get(eventName) || [ ];
        const registrationIndex = registrations.findIndex(r => r === handler);

        if (registrationIndex !== -1) {
            registrations.splice(registrationIndex, 1);
        }

        this._registrations.set(eventName, registrations);

        return registrationIndex !== -1;
    }
}

export default EventEmitter;

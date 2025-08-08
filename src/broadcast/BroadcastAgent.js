import BroadcastReadStream from '#broadcast/BroadcastReadStream.js';

import Assert from '#core/Assert.js';
import Logger from '#core/Logger.js';

import DeferredPromise from '#data/DeferredPromise.js';

import BroadcastFragmentType from '#data/enums/BroadcastFragmentType.js';

import BroadcastGateway from './BroadcastGateway.js';

const REQUEST_DELAY_MILLISECONDS = 1000;
const REQUEST_RETRIES = 5;
const STREAM_INACTIVITY_TIMEOUT_MILLISECONDS = 30 * 1000;

class BroadcastAgent {
    /**
     * @param {BroadcastGateway} gateway 
     * @param {number} match 
     * @param {Logger} [logger=Logger.CONSOLE_INFO]
     */
    constructor(gateway, match, logger = Logger.CONSOLE_DEBUG) {
        Assert.isTrue(gateway instanceof BroadcastGateway);
        Assert.isTrue(Number.isInteger(match));
        Assert.isTrue(logger instanceof Logger);

        this._gateway = gateway;
        this._match = match;
        this._logger = logger;

        this._listeners = [ ];

        this._finished = false;
        this._paused = false;
        this._started = false;
        
        this._pause = new DeferredPromise();
        this._pause.resolve();
    }

    /**
     * @returns {boolean} 
     */
    get finished() {
        return this._finished;
    }

    /**
     * @returns {boolean} 
     */
    get paused() {
        return this._paused;
    }

    /**
     * @returns {boolean} 
     */
    get started() {
        return this._started;
    }

    /**
     * @public
     */
    pause() {
        if (this._finished) {
            throw new Error('Unable to pause BroadcastAgent - it has been finished');
        }

        if (!this._started) {
            throw new Error('Unable to pause BroadcastAgent - it hasn\'t been started');
        }

        if (!this._paused) {
            this._pause = new DeferredPromise();
            this._paused = true;
        }
    }

    /** 
     * @public
     */
    resume() {
        if (this._finished) {
            throw new Error('Unable to resume BroadcastAgent - it has been finished');
        }

        if (!this._started) {
            throw new Error('Unable to resume BroadcastAgent - it hasn\'t been started');
        }

        if (this._paused) {
            this._pause.resolve();
            this._paused = false;
        }
    }

    /** 
     * @public
     * @param {boolean} [fromStart=false]
     * @returns {void}
     */
    start(fromStart = false) {
        if (this._finished) {
            throw new Error('Unable to start BroadcastAgent - it has been already started');
        }

        if (this._started) {
            throw new Error('Unable to start BroadcastAgent - it has been already started');
        }

        this._started = true;

        const monitor = async () => {
            this._logger.debug('Querying [ SYNC ]');

            let sync = await this._getSync();
            
            let currentFragment;

            if (fromStart) {
                currentFragment = 1;
            } else {
                currentFragment = Math.max(1, sync.fragment - 4);
            }

            this._logger.debug(`Querying [ ${BroadcastFragmentType.START.code} ] [ ${sync.signup_fragment} ]`);

            const initialization = await this._getFragment(BroadcastFragmentType.START, sync.signup_fragment);

            await this._pause.promise;

            this._send(initialization);

            this._logger.debug(`Querying [ ${BroadcastFragmentType.FULL.code} ] [ ${currentFragment} ]`);

            const full = await this._getFragment(BroadcastFragmentType.FULL, currentFragment);

            await this._pause.promise;

            this._send(full);

            let lastFragmentAt = Date.now();

            while (true) {
                if ((Date.now() - lastFragmentAt) > STREAM_INACTIVITY_TIMEOUT_MILLISECONDS) {
                    this._logger.debug(`BroadcastAgent is inactive for [ ${STREAM_INACTIVITY_TIMEOUT_MILLISECONDS} ] milliseconds. Finishing...`);

                    this.stop();

                    break;
                }

                if (currentFragment > sync.fragment) {
                    this._logger.debug('Querying [ SYNC ]');

                    sync = await this._getSync();

                    await wait(REQUEST_DELAY_MILLISECONDS);

                    continue;
                }

                this._logger.debug(`Querying [ ${BroadcastFragmentType.DELTA.code} ] [ ${currentFragment} ]`);

                const delta = await this._getFragment(BroadcastFragmentType.DELTA, currentFragment);
                
                lastFragmentAt = Date.now();
                currentFragment += 1;

                await this._pause.promise;
                
                this._send(delta);

                await wait(REQUEST_DELAY_MILLISECONDS);
            }
        };

        monitor();
    }

    /** 
     * @public
     */
    stop() {
        if (this._finished) {
            throw new Error('Unable to stop BroadcastAgent - it has been already finished');
        }

        if (!this._started) {
            throw new Error('Unable to stop BroadcastAgent - it hasn\'t been started');
        }

        this._send(null);

        this._finished = true;
    }

    /** 
     * @public
     * @param {boolean} [fromStart = false]
     * @param {*} [options={ }]
     * @returns {Stream.Readable|ReadableStream}
     */
    stream(fromStart = false, options = { }) {
        const readableStream = new BroadcastReadStream(this, options);

        this.start(fromStart);

        return readableStream;
    }

    /**
    * @public
    * @param {function((Buffer|null)): void} listener 
    */
    subscribe(listener) {
        this._listeners.push(listener);
    }

    /**
     * @public
     * @param {function((Buffer|null)): void} listener
     * @returns {boolean}
     */
    unsubscribe(listener) {
        const index = this._listeners.findIndex(l => l === listener);

        if (index === -1) {
            return false;
        }

        this._listeners.splice(index, 1);

        return true;
    }

    /**
     * @protected
     * @param {BroadcastFragmentType} fragmentType 
     * @param {number} fragment 
     * @returns {Promise<Buffer>} 
     */
    _getFragment(fragmentType, fragment) {
        return backoff.call(this, () => this._gateway.getFragment(this._match, fragmentType, fragment), REQUEST_RETRIES);
    }

    /**
     * @protected
     * @returns {Promise<SyncObject>} 
     */
    _getSync() {
        return backoff.call(this, () => this._gateway.getSync(this._match), REQUEST_RETRIES);
    }

    /**
    * @protected
    * @param {Buffer|null} bufferOrNull 
    */
    _send(bufferOrNull) {
        this._listeners.forEach((listener) => {
            listener(bufferOrNull);
        });
    }
}

/**
 * @param {() => Promise<*>} action 
 * @param {number} attempts
 * @param {number} [delay=500]
 * @returns {Promise<*>}
 */
async function backoff(action, attempts, delay = 500) {
    let attempt = 0;
    let exponentialDelay = delay;
    let result;

    for (let i = 0; i < attempts; i++) {
        try {
            result = await action();

            return result;
        } catch (error) {
            attempt += 1;

            this._logger.debug(`Backoff [ ${attempt} / ${attempts} ]: [ ${error.status} ] [ ${error.message} ]`);

            if (attempt >= attempts) {
                this._logger.error(error.response.data);

                this._stop();

                throw new Error(error.status);
            }

            await wait(exponentialDelay);

            exponentialDelay *= 2;
        }
    }

    return result;
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}

export default BroadcastAgent;


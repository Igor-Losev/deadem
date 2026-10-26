/** @import { InterceptorFn } from './ParserEngine.js' */

import Assert from './core/Assert.js';

import InterceptorStage from './data/enums/InterceptorStage.js';

/**
 * Holds pre/post interceptors per {@link InterceptorStage} and fires them.
 */
class InterceptorRegistry {
    /**
     * @public
     * @constructor
     * @param {boolean} userCommands - Whether the game decodes user commands.
     */
    constructor(userCommands) {
        Assert.isTrue(typeof userCommands === 'boolean');

        /** @private */
        this._userCommands = userCommands;

        /** @private */
        this._pre = createStages();
        /** @private */
        this._post = createStages();
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {...*} args
     */
    firePost(stage, ...args) {
        const interceptors = this._post[stage.id];

        for (let i = 0; i < interceptors.length; i++) {
            interceptors[i](...args);
        }
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {...*} args
     */
    firePre(stage, ...args) {
        const interceptors = this._pre[stage.id];

        for (let i = 0; i < interceptors.length; i++) {
            interceptors[i](...args);
        }
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @returns {boolean}
     */
    getIsRegistered(stage) {
        return this._pre[stage.id].length > 0 ||
            this._post[stage.id].length > 0;
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {InterceptorFn} interceptor
     */
    registerPost(stage, interceptor) {
        Assert.isTrue(stage instanceof InterceptorStage);
        Assert.isTrue(typeof interceptor === 'function');

        if (stage === InterceptorStage.USER_COMMAND && !this._userCommands) {
            throw new Error('InterceptorStage.USER_COMMAND is unsupported: this game registers no user command decoder');
        }

        this._post[stage.id] = [ ...this._post[stage.id], interceptor ];
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {InterceptorFn} interceptor
     */
    registerPre(stage, interceptor) {
        Assert.isTrue(stage instanceof InterceptorStage);
        Assert.isTrue(typeof interceptor === 'function');

        if (stage === InterceptorStage.USER_COMMAND) {
            throw new Error('InterceptorStage.USER_COMMAND has no pre phase: use registerPostInterceptor');
        }

        this._pre[stage.id] = [ ...this._pre[stage.id], interceptor ];
    }

    /**
     * Removes all interceptors for all stages.
     *
     * @public
     */
    reset() {
        this._pre = createStages();
        this._post = createStages();
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     * @returns {boolean}
     */
    unregisterPost(stage, interceptor) {
        Assert.isTrue(stage instanceof InterceptorStage);
        Assert.isTrue(typeof interceptor === 'function');

        const interceptors = this._post[stage.id];
        const filtered = interceptors.filter(i => i !== interceptor);

        if (filtered.length === interceptors.length) {
            return false;
        }

        this._post[stage.id] = filtered;

        return true;
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     * @returns {boolean}
     */
    unregisterPre(stage, interceptor) {
        Assert.isTrue(stage instanceof InterceptorStage);
        Assert.isTrue(typeof interceptor === 'function');

        const interceptors = this._pre[stage.id];
        const filtered = interceptors.filter(i => i !== interceptor);

        if (filtered.length === interceptors.length) {
            return false;
        }

        this._pre[stage.id] = filtered;

        return true;
    }
}

/**
 * @returns {Array<Array<InterceptorFn>>} One empty list per {@link InterceptorStage}.
 */
function createStages() {
    return Array.from({ length: InterceptorStage.getAll().length }, () => []);
}

export default InterceptorRegistry;

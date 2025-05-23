'use strict';

const assert = require('node:assert/strict');

const InterceptorStage = require('./data/enums/InterceptorStage');

const Logger = require('./Logger'),
    ParserConfiguration = require('./ParserConfiguration'),
    ParserEngine = require('./ParserEngine');

class Parser {
    /**
     * @constructor
     * @param {ParserConfiguration=} configuration
     * @param {Logger=} logger
     */
    constructor(configuration = ParserConfiguration.DEFAULT, logger = Logger.CONSOLE_INFO) {
        this._engine = new ParserEngine(configuration, logger);
    }

    /**
     * @public
     * @returns {Demo}
     */
    getDemo() {
        return this._engine.demo;
    }

    /**
     * @public
     * @param {Stream.Readable} reader
     * @returns {Promise<void>}
     */
    async parse(reader) {
        return this._engine.parse(reader);
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     */
    registerPostInterceptor(stage, interceptor) {
        assert(stage instanceof InterceptorStage);
        assert(typeof interceptor === 'function');

        this._engine.interceptors.post[stage.code].push(interceptor);
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     */
    registerPreInterceptor(stage, interceptor) {
        assert(stage instanceof InterceptorStage);
        assert(typeof interceptor === 'function');

        this._engine.interceptors.pre[stage.code].push(interceptor);
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     * @returns {boolean}
     */
    unregisterPostInterceptor(stage, interceptor) {
        const index = this._engine.interceptors.post[stage.code].findIndex(i => i === interceptor);

        if (index === -1) {
            return false;
        }

        this._engine.interceptors.post[stage.code].splice(index, 1);

        return true;
    }

    /**
     * @public
     * @param {InterceptorStage} stage
     * @param {Function} interceptor
     * @returns {boolean}
     */
    unregisterPreInterceptor(stage, interceptor) {
        const index = this._engine.interceptors.pre[stage.code].findIndex(i => i === interceptor);

        if (index === -1) {
            return false;
        }

        this._engine.interceptors.pre[stage.code].splice(index, 1);

        return true;
    }
}

module.exports = Parser;

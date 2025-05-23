'use strict';

class Logger {
    /**
     * @public
     * @param {*} logger
     */
    constructor(logger) {
        this._logger = logger;
    }

    /**
     * @public
     * @param {...any} args
     * @returns {*}
     */
    debug(...args) {
        return this._logger.debug(...args);
    }

    /**
     * @public
     * @param {...any} args
     * @returns {*}
     */
    error(...args) {
        return this._logger.error(...args);
    }

    /**
     * @public
     * @param {...any} args
     * @returns {*}
     */
    info(...args) {
        return this._logger.info(...args);
    }

    /**
     * @public
     * @param {...any} args
     * @returns {*}
     */
    trace(...args) {
        return this._logger.trace(...args);
    }

    /**
     * @public
     * @param {...any} args
     * @returns {*}
     */
    warn(...args) {
        return this._logger.warn(...args);
    }

    /**
     * @public
     * @returns {Logger}
     */
    static get CONSOLE_DEBUG() {
        return consoleDebugLogger;
    }

    /**
     * @public
     * @returns {Logger}
     */
    static get CONSOLE_INFO() {
        return consoleInfoLogger;
    }

    /**
     * @public
     * @returns {Logger}
     */
    static get CONSOLE_TRACE() {
        return consoleTraceLogger;
    }

    /**
     * @public
     * @returns {Logger}
     */
    static get CONSOLE_WARN() {
        return consoleWarnLogger;
    }

    /**
     * @public
     * @returns {Logger}
     */
    static get NOOP() {
        return noopLogger;
    }
}

const consoleDebugLogger = new Logger({
    debug: consoleDebugFn,
    error: consoleErrorFn,
    info: consoleInfoFn,
    trace: noopFn,
    warn: consoleWarnFn
});

const consoleInfoLogger = new Logger({
    debug: noopFn,
    error: consoleErrorFn,
    info: consoleInfoFn,
    trace: noopFn,
    warn: consoleWarnFn
});

const consoleTraceLogger = new Logger({
    debug: consoleDebugFn,
    error: consoleErrorFn,
    info: consoleInfoFn,
    trace: consoleTraceFn,
    warn: consoleWarnFn
});

const consoleWarnLogger = new Logger({
    debug: noopFn,
    error: consoleErrorFn,
    info: noopFn,
    trace: noopFn,
    warn: consoleWarnFn
});

const noopLogger = new Logger({
    debug: noopFn,
    error: noopFn,
    info: noopFn,
    trace: noopFn,
    warn: noopFn
});

const getPrefix = (colorIndex, level) => `\x1b[${colorIndex}m[${new Date().toISOString()}] [${level}]\x1b[0m -`;

function consoleDebugFn(...args) {
    console.debug(getPrefix(34, 'DEBUG'), ...args);
}

function consoleErrorFn(...args) {
    console.error(getPrefix(31, 'ERROR'), ...args);
}

function consoleInfoFn(...args) {
    console.info(getPrefix(32, 'INFO'), ...args);
}

function consoleTraceFn(...args) {
    console.trace(getPrefix(37, 'TRACE'), ...args);
}

function consoleWarnFn(...args) {
    console.warn(getPrefix(33, 'WARN'), ...args);
}

function noopFn() {

}

module.exports = Logger;

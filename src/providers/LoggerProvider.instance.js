const log4js = require('log4js');

const log4jsConfiguration = require('./../../log4js.config');

log4js.configure(log4jsConfiguration);

class LoggerProvider {
    constructor() {

    }

    /**
     * @public
     *
     * @param {String=} category
     * @returns {log4js.Logger}
     */
    getLogger(category) {
        return log4js.getLogger(category);
    }

    static instance = new LoggerProvider();
}

module.exports = LoggerProvider.instance;

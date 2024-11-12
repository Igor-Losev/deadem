module.exports = {
    appenders: {
        console: { type: 'console' }
    },
    categories: {
        default: { appenders: [ 'console' ], level: 'info' },
        Parser: { appenders: [ 'console' ], level: 'info' },
        StringTableContainer: { appenders: [ 'console' ], level: 'info' }
    }
};

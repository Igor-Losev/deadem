module.exports = {
    appenders: {
        console: { type: 'console' }
    },
    categories: {
        default: { appenders: [ 'console' ], level: 'info' },
        StringTableContainer: { appenders: [ 'console' ], level: 'info' },
        StringTableEntry: { appenders: [ 'console' ], level: 'info' }
    }
};

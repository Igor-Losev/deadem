module.exports = {
    appenders: {
        console: { type: 'console' }
    },
    categories: {
        default: { appenders: [ 'console' ], level: 'info' },

        DemoStreamPacketParser: { appenders: [ 'console' ], level: 'info' },

        FieldPathExtractor: { appenders: [ 'console' ], level: 'info' },
        Parser: { appenders: [ 'console' ], level: 'info' },
        StringTableContainer: { appenders: [ 'console' ], level: 'info' },

        'Tracker/Memory': { appenders: [ 'console' ], level: 'debug' },
        'Tracker/Packet': { appenders: [ 'console' ], level: 'debug' },
        'Tracker/Performance': { appenders: [ 'console' ], level: 'debug' },

        WorkerManager: { appenders: [ 'console' ], level: 'info' },
        WorkerThread: { appenders: [ 'console' ], level: 'info' }
    }
};

import Assert from '#core/Assert.js';

import MessagePacketType from '#data/enums/MessagePacketType.js';

const OPTIONS = {
    BATCHER_CHUNK_SIZE: 'batcherChunkSize',
    BATCHER_THRESHOLD_MILLISECONDS: 'batcherThresholdMilliseconds',
    BREAK_INTERVAL: 'breakInterval',
    ENTITY_CLASSES: 'entityClasses',
    MESSAGE_PACKET_TYPES: 'messagePacketTypes',
    MESSAGE_PACKET_TYPES_EXCLUDE: 'messagePacketTypesExclude',
    PARSER_THREADS: 'parserThreads',
    SPLITTER_CHUNK_SIZE: 'splitterChunkSize'
};

const CRITICAL_MESSAGE_PACKET_TYPES = new Set([
    MessagePacketType.SVC_SERVER_INFO,
    MessagePacketType.SVC_CREATE_STRING_TABLE,
    MessagePacketType.SVC_UPDATE_STRING_TABLE,
    MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES
]);

const DEFAULTS = {
    [OPTIONS.BREAK_INTERVAL]: 1000,
    [OPTIONS.BATCHER_CHUNK_SIZE]: 100 * 1024,
    [OPTIONS.BATCHER_THRESHOLD_MILLISECONDS]: 50,
    [OPTIONS.ENTITY_CLASSES]: null,
    [OPTIONS.MESSAGE_PACKET_TYPES]: null,
    [OPTIONS.MESSAGE_PACKET_TYPES_EXCLUDE]: null,
    [OPTIONS.PARSER_THREADS]: 0,
    [OPTIONS.SPLITTER_CHUNK_SIZE]: 200 * 1024
};

class ParserConfiguration {
    /**
     * @constructor
     * @param {{ batcherChunkSize?: number, batcherThresholdMilliseconds?: number, breakInterval?: number, entityClasses?: Array<string>, messagePacketTypes?: Array<MessagePacketType>, messagePacketTypesExclude?: Array<MessagePacketType>, parserThreads?: number, splitterChunkSize?: number }} options
     */
    constructor(options) {
        const getOption = key => (options && options[key]) ? options[key] : DEFAULTS[key];

        const batcherChunkSize = getOption(OPTIONS.BATCHER_CHUNK_SIZE);
        const batcherThresholdMilliseconds = getOption(OPTIONS.BATCHER_THRESHOLD_MILLISECONDS);
        const breakInterval = getOption(OPTIONS.BREAK_INTERVAL);
        const entityClasses = getOption(OPTIONS.ENTITY_CLASSES);
        const messagePacketTypes = getOption(OPTIONS.MESSAGE_PACKET_TYPES);
        const messagePacketTypesExclude = getOption(OPTIONS.MESSAGE_PACKET_TYPES_EXCLUDE);
        const parserThreads = getOption(OPTIONS.PARSER_THREADS);
        const splitterChunkSize = getOption(OPTIONS.SPLITTER_CHUNK_SIZE);

        Assert.isTrue(Number.isInteger(batcherChunkSize) && batcherChunkSize > 0, 'options.batcherChunkSize must be a positive integer');
        Assert.isTrue(Number.isInteger(batcherThresholdMilliseconds) && batcherThresholdMilliseconds > 0, 'options.batcherThresholdMilliseconds must be a positive integer');
        Assert.isTrue(Number.isInteger(breakInterval) && breakInterval > 0, 'options.breakInterval must be a positive integer');
        Assert.isTrue(entityClasses === null || (Array.isArray(entityClasses) && entityClasses.every(c => typeof c === 'string' && c.length > 0)), 'options.entityClasses must be an array of non-empty strings or null');
        Assert.isTrue(messagePacketTypes === null || Array.isArray(messagePacketTypes), 'options.messagePacketTypes must be an array or null');
        Assert.isTrue(messagePacketTypesExclude === null || Array.isArray(messagePacketTypesExclude), 'options.messagePacketTypesExclude must be an array or null');
        Assert.isTrue(messagePacketTypes === null || messagePacketTypesExclude === null, 'options.messagePacketTypes and options.messagePacketTypesExclude are mutually exclusive');
        Assert.isTrue(Number.isInteger(parserThreads) && parserThreads >= 0, 'options.parserThreads must be a not negative integer');
        Assert.isTrue(Number.isInteger(splitterChunkSize) && splitterChunkSize > 0, 'options.splitterChunkSize must be a positive integer');

        this._batcherChunkSize = batcherChunkSize;
        this._batcherThresholdMilliseconds = batcherThresholdMilliseconds;
        this._breakInterval = breakInterval;
        this._parserThreads = parserThreads;
        this._splitterChunkSize = splitterChunkSize;

        this._entityClassFilter = buildEntityClassFilter(entityClasses);
        this._messagePacketFilter = buildMessagePacketFilter(messagePacketTypes, messagePacketTypesExclude);

        if (entityClasses !== null && this._messagePacketFilter !== null) {
            Assert.isTrue(this._messagePacketFilter(MessagePacketType.SVC_PACKET_ENTITIES.id), 'options.entityClasses requires MessagePacketType.SVC_PACKET_ENTITIES to be enabled by options.messagePacketTypes/options.messagePacketTypesExclude');
        }
    }

    /**
     * @public
     * @returns {ParserConfiguration}
     */
    static get DEFAULT() {
        return defaultConfiguration;
    }

    /**
     * @public
     * @returns {number}
     */
    get batcherChunkSize() {
        return this._batcherChunkSize;
    }

    /**
     * @public
     * @returns {number}
     */
    get batcherThresholdMilliseconds() {
        return this._batcherThresholdMilliseconds;
    }

    /**
     * @public
     * @returns {number}
     */
    get breakInterval() {
        return this._breakInterval;
    }

    /**
     * @public
     * @returns {number}
     */
    get parserThreads() {
        return this._parserThreads;
    }

    /**
     * @public
     * @returns {number}
     */
    get splitterChunkSize() {
        return this._splitterChunkSize;
    }

    /**
     * Returns whether mutations of a given entity class should be processed.
     * Returns `true` when no `entityClasses` filter was configured.
     *
     * @public
     * @param {string} className
     * @returns {boolean}
     */
    getIsEntityClassAllowed(className) {
        return this._entityClassFilter === null || this._entityClassFilter(className);
    }

    /**
     * Returns whether a given message packet type ID should be processed.
     * Returns `true` when no `messagePacketTypes` / `messagePacketTypesExclude`
     * filter was configured.
     *
     * @public
     * @param {number} messagePacketTypeId
     * @returns {boolean}
     */
    getIsMessagePacketTypeAllowed(messagePacketTypeId) {
        return this._messagePacketFilter === null || this._messagePacketFilter(messagePacketTypeId);
    }
}

/**
 * @param {Array<string>|null} include
 * @returns {(function(string): boolean)|null}
 */
function buildEntityClassFilter(include) {
    if (include === null) {
        return null;
    }

    const allowed = new Set(include);

    return (className) => allowed.has(className);
}

/**
 * @param {Array<MessagePacketType>|null} include
 * @param {Array<MessagePacketType>|null} exclude
 * @returns {(function(number): boolean)|null}
 */
function buildMessagePacketFilter(include, exclude) {
    if (include !== null) {
        const allowed = new Set(include.map(t => t.id));

        for (const critical of CRITICAL_MESSAGE_PACKET_TYPES) {
            allowed.add(critical.id);
        }

        return (id) => allowed.has(id);
    }

    if (exclude !== null) {
        const denied = new Set(exclude.map(t => t.id));

        for (const critical of CRITICAL_MESSAGE_PACKET_TYPES) {
            denied.delete(critical.id);
        }

        return (id) => !denied.has(id);
    }

    return null;
}

const defaultConfiguration = new ParserConfiguration({ ...DEFAULTS });

export default ParserConfiguration;

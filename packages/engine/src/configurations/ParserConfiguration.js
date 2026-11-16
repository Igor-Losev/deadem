/** @import { StreamConfigurationOptions } from './StreamConfiguration.js' */

import Assert from '../core/Assert.js';

import MessagePacketType from '../data/enums/MessagePacketType.js';

import StreamConfiguration from './StreamConfiguration.js';

const OPTIONS = /** @type {const} */ ({
    ENTITY_CLASSES: 'entityClasses',
    MESSAGE_PACKET_TYPES: 'messagePacketTypes',
    MESSAGE_PACKET_TYPES_EXCLUDE: 'messagePacketTypesExclude'
});

const CRITICAL_MESSAGE_PACKET_TYPES = new Set([
    MessagePacketType.SVC_SERVER_INFO,
    MessagePacketType.SVC_CREATE_STRING_TABLE,
    MessagePacketType.SVC_UPDATE_STRING_TABLE,
    MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES
]);

const DEFAULTS = {
    [OPTIONS.ENTITY_CLASSES]: null,
    [OPTIONS.MESSAGE_PACKET_TYPES]: null,
    [OPTIONS.MESSAGE_PACKET_TYPES_EXCLUDE]: null
};

/**
 * @typedef {StreamConfigurationOptions & { entityClasses?: Array<string>|null, messagePacketTypes?: Array<MessagePacketType>|null, messagePacketTypesExclude?: Array<MessagePacketType>|null }} ParserConfigurationOptions
 */

class ParserConfiguration extends StreamConfiguration {
    /** @private @type {((className: string) => boolean)|null} */
    _entityClassFilter;

    /** @private @type {((messagePacketTypeId: number) => boolean)|null} */
    _messagePacketFilter;

    /**
     * @constructor
     * @param {ParserConfigurationOptions} [options]
     */
    constructor(options) {
        super(options);

        /**
         * @param {keyof typeof DEFAULTS} key
         * @returns {*}
         */
        const getOption = key => (options && options[key]) ? options[key] : DEFAULTS[key];

        const entityClasses = getOption(OPTIONS.ENTITY_CLASSES);
        const messagePacketTypes = getOption(OPTIONS.MESSAGE_PACKET_TYPES);
        const messagePacketTypesExclude = getOption(OPTIONS.MESSAGE_PACKET_TYPES_EXCLUDE);

        Assert.isTrue(entityClasses === null || (Array.isArray(entityClasses) && entityClasses.every(c => typeof c === 'string' && c.length > 0)), 'options.entityClasses must be an array of non-empty strings or null');
        Assert.isTrue(messagePacketTypes === null || Array.isArray(messagePacketTypes), 'options.messagePacketTypes must be an array or null');
        Assert.isTrue(messagePacketTypesExclude === null || Array.isArray(messagePacketTypesExclude), 'options.messagePacketTypesExclude must be an array or null');
        Assert.isTrue(messagePacketTypes === null || messagePacketTypesExclude === null, 'options.messagePacketTypes and options.messagePacketTypesExclude are mutually exclusive');

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
     * The configured entity class filter, or `null` when every class is allowed.
     *
     * @internal
     * @public
     * @returns {((className: string) => boolean)|null}
     */
    get entityClassFilter() {
        return this._entityClassFilter;
    }

    /**
     * The configured message packet filter, or `null` when every type is allowed.
     *
     * @internal
     * @public
     * @returns {((messagePacketTypeId: number) => boolean)|null}
     */
    get messagePacketFilter() {
        return this._messagePacketFilter;
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
 * @returns {((className: string) => boolean)|null}
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
 * @returns {((id: number) => boolean)|null}
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

const defaultConfiguration = new ParserConfiguration();

export default ParserConfiguration;

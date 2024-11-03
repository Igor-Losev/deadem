'use strict';

const Enum = require('./Enum');

const registry = {
    byCode: new Map(),
    byName: new Map()
}

class StringTableType extends Enum {
    /**
     * @private
     * @constructor
     *
     * @param {String} code
     * @param {String} name
     */
    constructor(code, name) {
        super(code, code);

        this._name = name;

        registry.byCode.set(code, this);
        registry.byName.set(name, this);
    }

    get name() {
        return this._name;
    }

    /**
     * @public
     * @static
     * @param {String} code
     * @returns {StringTableType|null}
     */
    static parse(code) {
        return registry.byCode.get(code) || null;
    }

    /**
     * @public
     * @static
     * @param {String} name
     * @returns {StringTableType|null}
     */
    static parseByName(name) {
        return registry.byName.get(name) || null;
    }

    /**
     * @public
     * @static
     * @returns {StringTableType}
     */
    static get ACTIVE_MODIFIERS() {
        return activeModifiers;
    }

    /**
     * @public
     * @static
     * @returns {StringTableType}
     */
    static get DECAL_PRE_CACHE() {
        return decalPreCache;
    }

    /**
     * @public
     * @static
     * @returns {StringTableType}
     */
    static get EFFECT_DISPATCH() {
        return effectDispatch;
    }

    /**
     * @public
     * @static
     * @returns {StringTableType}
     */
    static get ENTITY_NAMES() {
        return entityNames;
    }

    /**
     * @public
     * @static
     * @returns {StringTableType}
     */
    static get GENERIC_PRE_CACHE() {
        return genericPreCache;
    }

    /**
     * @public
     * @static
     * @returns {StringTableType}
     */
    static get INFO_PANEL() {
        return infoPanel;
    }

    /**
     * @public
     * @static
     * @returns {StringTableType}
     */
    static get INSTANCE_BASE_LINE() {
        return instanceBaseLine;
    }

    /**
     * @public
     * @static
     * @returns {StringTableType}
     */
    static get LIGHT_STYLES() {
        return lightStyles;
    }

    /**
     * @public
     * @static
     * @returns {StringTableType}
     */
    static get RESPONSE_KEYS() {
        return responseKeys;
    }

    /**
     * @public
     * @static
     * @returns {StringTableType}
     */
    static get SCENES() {
        return scenes;
    }

    /**
     * @public
     * @static
     * @returns {StringTableType}
     */
    static get SERVER_QUERY_INFO() {
        return serverQueryInfo;
    }

    /**
     * @public
     * @static
     * @returns {StringTableType}
     */
    static get USER_INFO() {
        return userInfo;
    }

    /**
     * @public
     * @static
     * @returns {StringTableType}
     */
    static get V_GUI_SCREEN() {
        return vGuiScreen;
    }
}

const activeModifiers = new StringTableType('ACTIVE_MODIFIERS', 'ActiveModifiers');
const decalPreCache = new StringTableType('DECAL_PRE_CACHE', 'decalprecache');
const effectDispatch = new StringTableType('EFFECT_DISPATCH', 'EffectDispatch');
const entityNames = new StringTableType('ENTITY_NAMES', 'EntityNames');
const genericPreCache = new StringTableType('GENERIC_PRE_CACHE', 'genericprecache');
const infoPanel = new StringTableType('INFO_PANEL', 'InfoPanel');
const instanceBaseLine = new StringTableType('INSTANCE_BASE_LINE', 'instancebaseline');
const lightStyles = new StringTableType('LIGHT_STYLES', 'lightstyles');
const responseKeys = new StringTableType('RESPONSE_KEYS', 'ResponseKeys');
const scenes = new StringTableType('SCENES', 'Scenes');
const serverQueryInfo = new StringTableType('SERVER_QUERY_INFO', 'server_query_info');
const userInfo = new StringTableType('USER_INFO', 'userinfo');
const vGuiScreen = new StringTableType('V_GUI_SCREEN', 'VguiScreen');

module.exports = StringTableType;

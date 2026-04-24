import Assert from '#core/Assert.js';

class StringTableType {
    /**
     * @constructor
     * @param {String} code
     * @param {String} name
     * @param {boolean} synthesized
     */
    constructor(code, name, synthesized = false) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(typeof name === 'string' && name.length > 0);
        Assert.isTrue(typeof synthesized === 'boolean');

        this._code = code;
        this._name = name;
        this._synthesized = synthesized;
    }

    /**
     * @public
     * @returns {String}
     */
    get code() {
        return this._code;
    }

    /**
     * @public
     * @returns {String}
     */
    get name() {
        return this._name;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get synthesized() {
        return this._synthesized;
    }

    /**
     * Creates a runtime-synthesized type for a name not known at bootstrap time.
     *
     * @public
     * @static
     * @param {String} name
     * @returns {StringTableType}
     */
    static synthesize(name) {
        return new StringTableType(name.toUpperCase(), name, true);
    }

    static get ACTIVE_MODIFIERS() { return activeModifiers; }
    static get DECAL_PRE_CACHE() { return decalPreCache; }
    static get EFFECT_DISPATCH() { return effectDispatch; }
    static get ENTITY_NAMES() { return entityNames; }
    static get GENERIC_PRE_CACHE() { return genericPreCache; }
    static get INFO_PANEL() { return infoPanel; }
    static get INSTANCE_BASE_LINE() { return instanceBaseLine; }
    static get LIGHT_STYLES() { return lightStyles; }
    static get RESPONSE_KEYS() { return responseKeys; }
    static get SCENES() { return scenes; }
    static get SERVER_QUERY_INFO() { return serverQueryInfo; }
    static get USER_INFO() { return userInfo; }
    static get V_GUI_SCREEN() { return vGuiScreen; }
    static get ANIM_TASK_TYPES() { return animTaskTypes; }
    static get ANIM_ASSET_DATA() { return animAssetData; }
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
const animTaskTypes = new StringTableType('ANIM_TASK_TYPES', 'AnimTaskTypes');
const animAssetData = new StringTableType('ANIM_ASSET_DATA', 'AnimAssetData');

export default StringTableType;

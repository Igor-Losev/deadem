import Assert from '../../core/Assert.js';

const registries = new WeakMap();

/**
 * Raw, undecoded entry payload.
 *
 * @typedef {Uint8Array|Array<*>|null} StringTableRawValue
 */

/**
 * @template {string} [C=string]
 * @template [D=*]
 */
class StringTableType {
    /**
     * @constructor
     * @param {C} code
     * @param {string} name
     * @param {string|null} [protoName=null]
     * @param {boolean} [lazy=false] - decode strategy flag for table entries.
     * @param {boolean} [synthesized=false]
     */
    constructor(code, name, protoName = null, lazy = false, synthesized = false) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(typeof name === 'string' && name.length > 0);
        Assert.isTrue(protoName === null || (typeof protoName === 'string' && protoName.length > 0));
        Assert.isTrue(typeof lazy === 'boolean');
        Assert.isTrue(typeof synthesized === 'boolean');

        /** @private */
        this._code = code;
        /** @private */
        this._name = name;
        /** @private */
        this._protoName = protoName;
        /** @private */
        this._lazy = lazy;
        /** @private */
        this._synthesized = synthesized;

        if (synthesized) {
            return;
        }

        const owner = new.target;

        let registry = registries.get(owner) || null;

        if (registry === null) {
            registry = new Map();

            registries.set(owner, registry);
        }

        registry.set(name, this);
    }

    /**
     * @public
     * @returns {C}
     */
    get code() {
        return this._code;
    }

    /**
     * @public
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @public
     * @returns {string|null}
     */
    get protoName() {
        return this._protoName;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get lazy() {
        return this._lazy;
    }

    /**
     * @public
     * @returns {boolean}
     */
    get synthesized() {
        return this._synthesized;
    }

    /**
     * @public
     * @static
     * @returns {Array<StringTableType>}
     */
    static getAll() {
        const members = new Map();

        for (let owner = this; typeof owner === 'function'; owner = Object.getPrototypeOf(owner)) {
            const registry = registries.get(owner) || null;

            if (registry === null) {
                continue;
            }

            for (const [ name, member ] of registry) {
                if (!members.has(name)) {
                    members.set(name, member);
                }
            }
        }

        return Array.from(members.values());
    }

    /**
     * Creates a runtime-synthesized type for a name not known at bootstrap time.
     *
     * @internal
     * @public
     * @static
     * @param {string} name
     * @returns {StringTableType}
     */
    static synthesize(name) {
        return new StringTableType(name.toUpperCase(), name, null, false, true);
    }

    /** @returns {StringTableType<'DECAL_PRE_CACHE', StringTableRawValue>} */
    static get DECAL_PRE_CACHE() { return decalPreCache; }
    /** @returns {StringTableType<'EFFECT_DISPATCH', StringTableRawValue>} */
    static get EFFECT_DISPATCH() { return effectDispatch; }
    /** @returns {StringTableType<'ENTITY_NAMES', StringTableRawValue>} */
    static get ENTITY_NAMES() { return entityNames; }
    /** @returns {StringTableType<'GENERIC_PRE_CACHE', StringTableRawValue>} */
    static get GENERIC_PRE_CACHE() { return genericPreCache; }
    /** @returns {StringTableType<'INFO_PANEL', StringTableRawValue>} */
    static get INFO_PANEL() { return infoPanel; }
    /** @returns {StringTableType<'INSTANCE_BASE_LINE', StringTableRawValue>} */
    static get INSTANCE_BASE_LINE() { return instanceBaseLine; }
    /** @returns {StringTableType<'LIGHT_STYLES', StringTableRawValue>} */
    static get LIGHT_STYLES() { return lightStyles; }
    /** @returns {StringTableType<'RESPONSE_KEYS', StringTableRawValue>} */
    static get RESPONSE_KEYS() { return responseKeys; }
    /** @returns {StringTableType<'SCENES', StringTableRawValue>} */
    static get SCENES() { return scenes; }
    /** @returns {StringTableType<'SERVER_QUERY_INFO', StringTableRawValue>} */
    static get SERVER_QUERY_INFO() { return serverQueryInfo; }
    /** @returns {StringTableType<'USER_INFO'>} */
    static get USER_INFO() { return userInfo; }
    /** @returns {StringTableType<'V_GUI_SCREEN', StringTableRawValue>} */
    static get V_GUI_SCREEN() { return vGuiScreen; }
    /** @returns {StringTableType<'ANIM_TASK_TYPES', StringTableRawValue>} */
    static get ANIM_TASK_TYPES() { return animTaskTypes; }
    /** @returns {StringTableType<'ANIM_ASSET_DATA', StringTableRawValue>} */
    static get ANIM_ASSET_DATA() { return animAssetData; }
}

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
const userInfo = new StringTableType('USER_INFO', 'userinfo', 'CMsgPlayerInfo');
const vGuiScreen = new StringTableType('V_GUI_SCREEN', 'VguiScreen');
const animTaskTypes = new StringTableType('ANIM_TASK_TYPES', 'AnimTaskTypes');
const animAssetData = new StringTableType('ANIM_ASSET_DATA', 'AnimAssetData');

export default StringTableType;

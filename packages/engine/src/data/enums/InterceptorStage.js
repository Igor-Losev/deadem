const registry = {
    byId: new Map()
};

/**
 * @template {string} [C=string]
 */
class InterceptorStage {
    /**
     * @constructor
     * @param {C} code
     * @param {number} id
     */
    constructor(code, id) {
        this._code = code;
        this._id = id;

        registry.byId.set(id, this);
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
     * @returns {number}
     */
    get id() {
        return this._id;
    }

    /**
     * @public
     * @static
     * @returns {Array<InterceptorStage>}
     */
    static getAll() {
        return Array.from(registry.byId.values());
    }

    /**
     * @public
     * @static
     * @returns {InterceptorStage<'DEMO_PACKET'>}
     */
    static get DEMO_PACKET() {
        return demoPacket;
    }

    /**
     * @public
     * @static
     * @returns {InterceptorStage<'ENTITY_PACKET'>}
     */
    static get ENTITY_PACKET() {
        return entityPacket;
    }

    /**
     * @public
     * @static
     * @returns {InterceptorStage<'MESSAGE_PACKET'>}
     */
    static get MESSAGE_PACKET() {
        return messagePacket;
    }

    /**
     * @public
     * @static
     * @returns {InterceptorStage<'USER_COMMAND'>}
     */
    static get USER_COMMAND() {
        return userCommand;
    }
}

const demoPacket = new InterceptorStage('DEMO_PACKET', 0);
const messagePacket = new InterceptorStage('MESSAGE_PACKET', 1);
const entityPacket = new InterceptorStage('ENTITY_PACKET', 2);
const userCommand = new InterceptorStage('USER_COMMAND', 3);

export default InterceptorStage;

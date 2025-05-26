class InterceptorStage {
    /**
     * @constructor
     * @param {String} code
     */
    constructor(code) {
        this._code = code;
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
     * @static
     * @returns {InterceptorStage}
     */
    static get DEMO_PACKET() {
        return demoPacket;
    }

    /**
     * @public
     * @static
     * @returns {InterceptorStage}
     */
    static get ENTITY_PACKET() {
        return entityPacket;
    }

    /**
     * @public
     * @static
     * @returns {InterceptorStage}
     */
    static get MESSAGE_PACKET() {
        return messagePacket;
    }
}

const demoPacket = new InterceptorStage('DEMO_PACKET');
const entityPacket = new InterceptorStage('ENTITY_PACKET');
const messagePacket = new InterceptorStage('MESSAGE_PACKET');

export default InterceptorStage;

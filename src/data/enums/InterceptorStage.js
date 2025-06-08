class InterceptorStage {
    /**
     * @constructor
     * @param {String} code
     * @param {number} id
     */
    constructor(code, id) {
        this._code = code;
        this._id = id;
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
     * @returns {number}
     */
    get id() {
        return this._id;
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

const demoPacket = new InterceptorStage('DEMO_PACKET', 0);
const messagePacket = new InterceptorStage('MESSAGE_PACKET', 1);
const entityPacket = new InterceptorStage('ENTITY_PACKET', 2);

export default InterceptorStage;

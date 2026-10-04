import Assert from '../../core/Assert.js';

const registries = new WeakMap();

class EmbeddedMessageType {
    /**
     * @constructor
     * @param {string} code
     * @param {string} protoName
     */
    constructor(code, protoName) {
        Assert.isTrue(typeof code === 'string' && code.length > 0);
        Assert.isTrue(typeof protoName === 'string' && protoName.length > 0);

        /** @private */
        this._code = code;
        /** @private */
        this._protoName = protoName;

        const owner = new.target;

        let registry = registries.get(owner) || null;

        if (registry === null) {
            registry = new Map();

            registries.set(owner, registry);
        }

        registry.set(code, this);
    }

    /**
     * @public
     * @returns {string}
     */
    get code() {
        return this._code;
    }

    /**
     * @public
     * @returns {string}
     */
    get protoName() {
        return this._protoName;
    }

    /**
     * @public
     * @static
     * @returns {Array<EmbeddedMessageType>}
     */
    static getAll() {
        const members = new Map();

        for (let owner = this; typeof owner === 'function'; owner = Object.getPrototypeOf(owner)) {
            const registry = registries.get(owner) || null;

            if (registry === null) {
                continue;
            }

            for (const [ code, member ] of registry) {
                if (!members.has(code)) {
                    members.set(code, member);
                }
            }
        }

        return Array.from(members.values());
    }

    static get SEND_TABLES_SERIALIZER() { return sendTablesSerializer; }
}

const sendTablesSerializer = new EmbeddedMessageType('SEND_TABLES_SERIALIZER', 'CSVCMsg_FlattenedSerializer');

export default EmbeddedMessageType;

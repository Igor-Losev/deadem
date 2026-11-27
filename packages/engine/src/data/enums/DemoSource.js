import DemoPacketType from './DemoPacketType.js';

const registry = {
    byCode: new Map(),
    byId: new Map()
};

class DemoSource {
    /**
     * @constructor
     * @param {string} code
     * @param {number} id
     * @param {Array<DemoPacketType>} [unwrappedTypes=[ ]]
     */
    constructor(code, id, unwrappedTypes = [ ]) {
        /** @private */
        this._code = code;
        /** @private */
        this._id = id;
        /** @private */
        this._unwrappedTypes = new Set(unwrappedTypes);

        registry.byCode.set(code, this);
        registry.byId.set(id, this);
    }

    /**
     * @returns {string}
     */
    get code() {
        return this._code;
    }

    /**
     * @returns {number}
     */
    get id() {
        return this._id;
    }

    /**
     * @public
     * @param {string} code
     * @returns {DemoSource|null}
     */
    static parse(code) {
        return registry.byCode.get(code) || null;
    }

    /**
     * @public
     * @param {number} id
     * @returns {DemoSource|null}
     */
    static parseById(id) {
        return registry.byId.get(id) || null;
    }

    /**
     * Whether the source sends the payload of the type without its protobuf message around it.
     *
     * @public
     * @param {DemoPacketType} demoPacketType
     * @returns {boolean}
     */
    getIsUnwrapped(demoPacketType) {
        return this._unwrappedTypes.has(demoPacketType);
    }

    /**
     * @public
     * @static
     * @returns {DemoSource}
     */
    static get HTTP_BROADCAST() {
        return httpBroadcast;
    }

    /**
     * @public
     * @static
     * @returns {DemoSource}
     */
    static get REPLAY() {
        return replay;
    }
}

const httpBroadcast = new DemoSource('HTTP_BROADCAST', 0, [ DemoPacketType.DEM_PACKET, DemoPacketType.DEM_SIGNON_PACKET, DemoPacketType.DEM_SPAWN_GROUPS ]);
const replay = new DemoSource('REPLAY', 1);

export default DemoSource;


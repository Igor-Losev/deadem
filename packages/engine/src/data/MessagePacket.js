/** @import { GenMessage } from '@bufbuild/protobuf/codegenv2' */

/** @import SchemaRegistry from '../SchemaRegistry.js' */

/** @import MessagePacketType from './enums/MessagePacketType.js' */

/**
 * @template [M=null]
 * @template {string|null} [N=string|null]
 */
class MessagePacket {
    /**
     * @public
     * @constructor
     *
     * @param {MessagePacketType<N>} type
     * @param {*} data
     */
    constructor(type, data) {
        /** @private */
        this._type = type;
        /** @private */
        this._data = data;
    }

    /**
     * @returns {MessagePacketType<N>}
     */
    get type() {
        return this._type;
    }

    /**
     * @returns {MessagePayload<M, N>}
     */
    get data() {
        return this._data;
    }

    /**
     * @public
     * @template {string|null} T
     * @param {MessagePacketType<T>} type
     * @returns {this is MessagePacket<M, T>}
     */
    is(type) {
        return this._type.id === type.id;
    }

    /**
     * @public
     * @returns {MessagePacketObject}
     */
    toObject() {
        return {
            type: this._type.code,
            data: this._data
        };
    }

    /**
     * @public
     * @static
     * @param {MessagePacketObject} raw
     * @param {SchemaRegistry} registry
     * @returns {MessagePacket}
     */
    static fromObject(raw, registry) {
        const type = registry.resolveMessageTypeByCode(raw.type);

        if (type === null) {
            throw new Error(`Unknown MessagePacketType [ ${raw.type} ]`);
        }

        return new MessagePacket(type, raw.data);
    }
}

/**
 * @typedef {{type: string, data: *}} MessagePacketObject
 */

/**
 * @template M, N
 * @typedef {M extends null ? * : N extends string ? SchemaMessage<M, `${N}Schema`> : unknown} MessagePayload
 */

/**
 * @template M, K
 * @typedef {K extends keyof M ? M[K] extends GenMessage<infer T> ? T : unknown : unknown} SchemaMessage
 */

export default MessagePacket;

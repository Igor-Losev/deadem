import Assert from '#core/Assert.js';

import BroadcastFragmentType from '#data/enums/BroadcastFragmentType.js';
import Protocol from '#data/enums/Protocol.js';

class BroadcastGateway {
    /**
    * @constructor
    * @param {String} baseUrl
    * @param {Protocol} [protocol=Protocol.HTTPS]
    */
    constructor(baseUrl, protocol = Protocol.HTTPS) {
        Assert.isTrue(typeof baseUrl === 'string');
        Assert.isTrue(protocol instanceof Protocol);

        this._baseUrl = baseUrl;
        this._protocol = protocol;
    }

    /**
     * @public
     * @param {number|string} match
     * @param {BroadcastFragmentType} fragmentType
     * @param {number} fragment
     * @returns {Promise<Uint8Array>}
     */
    async getFragment(match, fragmentType, fragment) {
        Assert.isTrue(Number.isInteger(match) || typeof match === 'string');
        Assert.isTrue(fragmentType instanceof BroadcastFragmentType);
        Assert.isTrue(Number.isInteger(fragment) && fragment >= 0);

        const response = await fetch(`${this._protocol.scheme}://${this._baseUrl}/${match}/${fragment}/${fragmentType.endpoint}`);

        if (!response.ok) {
            throw this._createHttpError(response);
        }

        return new Uint8Array(await response.arrayBuffer());
    }

    /**
    * @public
    * @param {number|string} match
    * @returns {Promise<SyncObject>}
    */
    async getSync(match) {
        Assert.isTrue(Number.isInteger(match) || typeof match === 'string');

        const response = await fetch(`${this._protocol.scheme}://${this._baseUrl}/${match}/sync`);

        if (!response.ok) {
            throw this._createHttpError(response);
        }

        return response.json();
    }

    /**
     * @protected
     * @param {Response} response 
     * @returns {Error}
     */
    _createHttpError(response) {
        const error = new Error(`HTTP code [ ${response.status} ]`);

        error.details = {
            status: response.status,
            statusText: response.statusText,
            url: response.url
        };

        return error;
    }
}

/**
 * @typedef {Object} SyncObject
 * @property {number} tick
 * @property {number} endtick
 * @property {number} maxtick
 * @property {number} rtdelay
 * @property {number} rcvage
 * @property {number} fragment
 * @property {number} signup_fragment
 * @property {number} tps
 * @property {number} keyframe_interval
 * @property {string} map
 * @property {number} protocol
 */

export default BroadcastGateway;

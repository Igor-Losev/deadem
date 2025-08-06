import axios from 'axios';

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
     * @param {number} match
     * @param {BroadcastFragmentType} fragmentType 
     * @param {number} fragment 
     * @returns {Promise<Buffer>}
     */
    async getFragment(match, fragmentType, fragment) {
        Assert.isTrue(Number.isInteger(match) && match > 0);
        Assert.isTrue(fragmentType instanceof BroadcastFragmentType);
        Assert.isTrue(Number.isInteger(fragment) && fragment >= 0);

        const response = await axios.get(`${this._protocol.scheme}://${this._baseUrl}/${match}/${fragment}/${fragmentType.endpoint}`, {
            responseType: 'arraybuffer'
        });

        return response.data;
    }

    /**
    * @public
    * @param {number} match 
    * @returns {Promise<SyncObject>}
    */
    async getSync(match) {
        Assert.isTrue(Number.isInteger(match) && match > 0);

        const response = await axios.get(`${this._protocol.scheme}://${this._baseUrl}/${match}/sync`);

        return response.data;
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


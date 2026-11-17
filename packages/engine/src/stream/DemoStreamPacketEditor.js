/** @import DemoPacketRaw from '../data/DemoPacketRaw.js' */

import Assert from '../core/Assert.js';

import Transform from '#core/stream/Transform.js';

import StreamConfiguration from '../configurations/StreamConfiguration.js';

import DemoPacketType from '../data/enums/DemoPacketType.js';

import PacketCodec from '../schema/PacketCodec.js';

/**
 * Edits the contents of the packets of a cut.
 */
class DemoStreamPacketEditor extends Transform {
    /** @private @type {PacketCodec} */
    _codec;

    /** @private @type {{ demPackets: number }} */
    _counts = { demPackets: 0 };

    /**
     * @public
     * @constructor
     * @param {StreamConfiguration} configuration
     * @param {PacketCodec} codec
     */
    constructor(configuration, codec) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof StreamConfiguration, 'Invalid configuration: expected an instance of StreamConfiguration');
        Assert.isTrue(codec instanceof PacketCodec, 'Invalid codec: expected an instance of PacketCodec');

        this._codec = codec;
    }

    /**
     * Writes the length of the cut into DEM_FileInfo: its last tick, its DEM_Packet count and its seconds.
     *
     * @private
     * @param {*} fileInfo
     * @param {number} tick - The tick of DEM_FileInfo, the last tick of the cut.
     */
    _editFileInfo(fileInfo, tick) {
        Assert.isTrue(fileInfo.playbackTicks > 0, 'Unable to edit DEM_FileInfo: it has no playback ticks');

        fileInfo.playbackTime = tick * fileInfo.playbackTime / fileInfo.playbackTicks;
        fileInfo.playbackTicks = tick;
        fileInfo.playbackFrames = this._counts.demPackets;
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {Promise<void>}
     */
    async _handle(demoPacketRaw) {
        const typeId = demoPacketRaw.getTypeId();

        if (typeId === DemoPacketType.DEM_PACKET.id) {
            this._counts.demPackets += 1;
        }

        if (typeId === DemoPacketType.DEM_FILE_INFO.id) {
            this._push(this._codec.editRaw(demoPacketRaw, (fileInfo) => this._editFileInfo(fileInfo, demoPacketRaw.tick.value)));
        } else {
            this._push(demoPacketRaw);
        }
    }
}

export default DemoStreamPacketEditor;

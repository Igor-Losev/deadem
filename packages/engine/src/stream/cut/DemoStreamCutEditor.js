/** @import DemoPacketRaw from '../../data/DemoPacketRaw.js' */

import Assert from '../../core/Assert.js';

import Transform from '#core/stream/Transform.js';

import StreamConfiguration from '../../configurations/StreamConfiguration.js';

import DemoCutPlan from '../../cut/DemoCutPlan.js';

import DemoCutAction from '../../data/enums/DemoCutAction.js';
import DemoPacketType from '../../data/enums/DemoPacketType.js';
import MessagePacketType from '../../data/enums/MessagePacketType.js';

import MessagePacketRawExtractor from '../../extractors/MessagePacketRawExtractor.js';

import PacketCodec from '../../schema/PacketCodec.js';

import MessagePacketRawWriter from '../../writers/MessagePacketRawWriter.js';

const CATCH_UP_MESSAGE_PACKET_TYPE_IDS = new Set([
    MessagePacketType.NET_SET_CON_VAR.id,
    MessagePacketType.NET_SPAWN_GROUP_LOAD.id,
    MessagePacketType.NET_SPAWN_GROUP_MANIFEST_UPDATE.id,
    MessagePacketType.NET_SPAWN_GROUP_SET_CREATION_TICK.id,
    MessagePacketType.NET_TICK.id,
    MessagePacketType.SVC_UPDATE_STRING_TABLE.id
]);

/**
 * Edits the contents of the packets of a cut.
 */
class DemoStreamCutEditor extends Transform {
    /** @private @type {PacketCodec} */
    _codec;

    /** @private @type {{ demPackets: number }} */
    _counts = { demPackets: 0 };

    /** @private @type {DemoCutPlan} */
    _plan;

    /**
     * @public
     * @constructor
     * @param {StreamConfiguration} configuration
     * @param {DemoCutPlan} plan
     * @param {PacketCodec} codec
     */
    constructor(configuration, plan, codec) {
        super(configuration.streamHighWaterMark);

        Assert.isTrue(configuration instanceof StreamConfiguration, 'Invalid configuration: expected an instance of StreamConfiguration');
        Assert.isTrue(plan instanceof DemoCutPlan, 'Invalid plan: expected an instance of DemoCutPlan');
        Assert.isTrue(codec instanceof PacketCodec, 'Invalid codec: expected an instance of PacketCodec');

        this._plan = plan;
        this._codec = codec;
    }

    /**
     * @private
     * @param {DemoPacketRaw} demoPacketRaw
     */
    _forward(demoPacketRaw) {
        if (demoPacketRaw.is(DemoPacketType.DEM_PACKET)) {
            this._counts.demPackets += 1;
        }

        this._push(demoPacketRaw);
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {Promise<void>}
     */
    async _handle(demoPacketRaw) {
        if (this._plan.is(demoPacketRaw.sequence, DemoCutAction.SNAPSHOT)) {
            this._forward(this._repackSnapshot(demoPacketRaw));
        }

        if (this._plan.is(demoPacketRaw.sequence, DemoCutAction.FILE_INFO)) {
            this._forward(this._repackFileInfo(demoPacketRaw));

            return;
        }

        if (this._plan.is(demoPacketRaw.sequence, DemoCutAction.CATCH_UP)) {
            this._forward(this._repackCatchUp(demoPacketRaw));

            return;
        }

        this._forward(demoPacketRaw);
    }

    /**
     * Returns DEM_Packet with the string tables and the partial state only, DEM_Recovery as is.
     *
     * @private
     * @param {DemoPacketRaw} demoPacketRaw - DEM_Packet or DEM_Recovery.
     * @returns {DemoPacketRaw}
     */
    _repackCatchUp(demoPacketRaw) {
        if (demoPacketRaw.is(DemoPacketType.DEM_RECOVERY)) {
            return demoPacketRaw;
        }

        const packet = this._codec.unpackDemoPacketRaw(demoPacketRaw);

        const messagePacketsRaw = new MessagePacketRawExtractor(packet.data)
            .all(type => CATCH_UP_MESSAGE_PACKET_TYPE_IDS.has(type));

        packet.data = new MessagePacketRawWriter(messagePacketsRaw).all();

        return this._codec.repackDemoPacketRaw(demoPacketRaw, packet);
    }

    /**
     * Writes the length of the cut into DEM_FileInfo: its last tick, its DEM_Packet count and its seconds.
     *
     * @private
     * @param {DemoPacketRaw} demoPacketRaw - DEM_FileInfo.
     * @returns {DemoPacketRaw}
     */
    _repackFileInfo(demoPacketRaw) {
        const fileInfo = this._codec.unpackDemoPacketRaw(demoPacketRaw);
        const tick = demoPacketRaw.tick.value;

        Assert.isTrue(fileInfo.playbackTicks > 0, 'Unable to repack DEM_FileInfo: it has no playback ticks');

        fileInfo.playbackTime = tick * fileInfo.playbackTime / fileInfo.playbackTicks;
        fileInfo.playbackTicks = tick;
        fileInfo.playbackFrames = this._counts.demPackets;

        return this._codec.repackDemoPacketRaw(demoPacketRaw, fileInfo);
    }

    /**
     * Returns the DEM_Packet inside the snapshot, without the keyframe of the user commands.
     *
     * @private
     * @param {DemoPacketRaw} demoPacketRaw - DEM_FullPacket.
     * @returns {DemoPacketRaw}
     */
    _repackSnapshot(demoPacketRaw) {
        const fullPacket = this._codec.unpackDemoPacketRaw(demoPacketRaw);

        const messagePacketsRaw = new MessagePacketRawExtractor(fullPacket.packet.data)
            .all(type => type !== MessagePacketType.SVC_USER_COMMAND_KEYFRAME.id);

        fullPacket.packet.data = new MessagePacketRawWriter(messagePacketsRaw).all();

        return this._codec.repackDemoPacketRaw(demoPacketRaw.withType(DemoPacketType.DEM_PACKET), fullPacket.packet);
    }
}

export default DemoStreamCutEditor;

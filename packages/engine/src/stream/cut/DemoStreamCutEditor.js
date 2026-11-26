/** @import { Message } from '@bufbuild/protobuf' */
/** @import DemoPacketRaw from '../../data/DemoPacketRaw.js' */
/** @import MessagePacketRaw from '../../data/MessagePacketRaw.js' */

import Assert from '../../core/Assert.js';

import Transform from '#core/stream/Transform.js';

import StreamConfiguration from '../../configurations/StreamConfiguration.js';

import DemoCutPlan from '../../cut/DemoCutPlan.js';

import DemoCutAction from '../../data/enums/DemoCutAction.js';
import DemoPacketType from '../../data/enums/DemoPacketType.js';
import MessagePacketType from '../../data/enums/MessagePacketType.js';

import MessagePacketRawExtractor from '../../extractors/MessagePacketRawExtractor.js';

import PacketCodec from '../../schema/PacketCodec.js';
import StringTableCodec from '../../schema/StringTableCodec.js';

import MessagePacketRawWriter from '../../writers/MessagePacketRawWriter.js';

const STATE_MESSAGE_PACKET_TYPE_IDS = new Set([
    MessagePacketType.NET_SET_CON_VAR.id,
    MessagePacketType.NET_SPAWN_GROUP_LOAD.id,
    MessagePacketType.NET_SPAWN_GROUP_MANIFEST_UPDATE.id,
    MessagePacketType.NET_SPAWN_GROUP_SET_CREATION_TICK.id
]);

/**
 * Applies a {@link DemoCutPlan} to a stream of demo packets.
 */
class DemoStreamCutEditor extends Transform {
    /** @private @type {PacketCodec} */
    _codec;

    /** @private @type {{ demPackets: number }} */
    _counts = { demPackets: 0 };

    /** @private @type {DemoCutPlan} */
    _plan;

    /** @private @type {{ messages: Array<MessagePacketRaw>, recoveries: Array<DemoPacketRaw> }} */
    _state = { messages: [ ], recoveries: [ ] };

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

        this._codec = codec;
        this._plan = plan;
    }

    /**
     * @private
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {DemoPacketRaw}
     */
    _applyTick(demoPacketRaw) {
        const tick = this._plan.getTick(demoPacketRaw.sequence);

        return tick === demoPacketRaw.tick.value ? demoPacketRaw : demoPacketRaw.withTick(tick);
    }

    /**
     * Collects state messages from DEM_Packet and buffers DEM_Recovery before the snapshot.
     *
     * @private
     * @param {DemoPacketRaw} demoPacketRaw - DEM_Packet or DEM_Recovery.
     */
    _collectState(demoPacketRaw) {
        if (demoPacketRaw.is(DemoPacketType.DEM_RECOVERY)) {
            this._state.recoveries.push(demoPacketRaw);

            return;
        }

        const packet = this._codec.unpackDemoPacketRaw(demoPacketRaw);

        const messagePacketsRaw = new MessagePacketRawExtractor(packet.data)
            .all(type => STATE_MESSAGE_PACKET_TYPE_IDS.has(type));

        for (let i = 0; i < messagePacketsRaw.length; i++) {
            this._state.messages.push(messagePacketsRaw[i]);
        }
    }

    /**
     * Builds the snapshot DEM_Packet from the anchor packet data, prepending collected state messages and dropping the user command keyframe.
     *
     * @private
     * @param {DemoPacketRaw} demoPacketRaw - DEM_FullPacket.
     * @param {Uint8Array} data - Raw message bytes of the anchor packet.
     * @returns {DemoPacketRaw}
     */
    _createSnapshotPacket(demoPacketRaw, data) {
        const snapshotMessages = new MessagePacketRawExtractor(data)
            .all(type => type !== MessagePacketType.SVC_USER_COMMAND_KEYFRAME.id);

        const message = this._codec.createDemoPacketMessage(DemoPacketType.DEM_PACKET, {
            data: new MessagePacketRawWriter([ ...this._state.messages, ...snapshotMessages ]).all()
        });

        return this._codec.repackDemoPacketRaw(demoPacketRaw.withType(DemoPacketType.DEM_PACKET), message);
    }

    /**
     * @private
     * @returns {Message}
     */
    _createStringTablesMessage() {
        const tables = this._plan.stringTables;

        Assert.exists(tables, 'Unable to write string tables: plan has no string tables');

        return this._codec.createDemoPacketMessage(
            DemoPacketType.DEM_STRING_TABLES,
            StringTableCodec.toDemoStringTables(tables)
        );
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
     * Emits any console commands scheduled after the packet.
     *
     * @private
     * @param {DemoPacketRaw} demoPacketRaw
     */
    _forwardCommands(demoPacketRaw) {
        const commands = this._plan.getCommands(demoPacketRaw.sequence);

        if (commands === null) {
            return;
        }

        const tick = Math.max(this._plan.getTick(demoPacketRaw.sequence), 0);

        for (let i = 0; i < commands.length; i++) {
            const message = this._codec.createDemoPacketMessage(DemoPacketType.DEM_CONSOLE_CMD, { cmdstring: commands[i] });

            this._forward(this._codec.repackDemoPacketRaw(demoPacketRaw.withType(DemoPacketType.DEM_CONSOLE_CMD).withTick(tick), message));
        }
    }

    /**
     * Emits buffered recoveries, the snapshot DEM_Packet with collected state messages, and the repacked DEM_FullPacket.
     *
     * @private
     * @param {DemoPacketRaw} demoPacketRaw - DEM_FullPacket.
     */
    _forwardSnapshot(demoPacketRaw) {
        const fullPacket = this._codec.unpackDemoPacketRaw(demoPacketRaw);

        for (let i = 0; i < this._state.recoveries.length; i++) {
            this._forward(this._state.recoveries[i].withTick(demoPacketRaw.tick.value));
        }

        this._forward(this._createSnapshotPacket(demoPacketRaw, fullPacket.packet.data));

        fullPacket.stringTable = this._createStringTablesMessage();

        this._forward(this._codec.repackDemoPacketRaw(demoPacketRaw, fullPacket));

        this._state.messages.length = 0;
        this._state.recoveries.length = 0;
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {Promise<void>}
     */
    async _handle(demoPacketRaw) {
        switch (this._plan.getAction(demoPacketRaw.sequence)) {
            case DemoCutAction.DROP: {
                return;
            }
            case DemoCutAction.COLLECT_STATE: {
                this._collectState(demoPacketRaw);

                return;
            }
            case DemoCutAction.START_TABLES: {
                this._forward(this._repackStartTables(this._applyTick(demoPacketRaw)));

                break;
            }
            case DemoCutAction.SNAPSHOT: {
                this._forwardSnapshot(this._applyTick(demoPacketRaw));

                break;
            }
            case DemoCutAction.KEEP: {
                this._forward(this._applyTick(demoPacketRaw));

                break;
            }
            case DemoCutAction.FILE_INFO: {
                this._forward(this._repackFileInfo(this._applyTick(demoPacketRaw)));

                break;
            }
        }

        this._forwardCommands(demoPacketRaw);
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
     * Writes the string tables of the plan into the bootstrap DEM_StringTables.
     *
     * @private
     * @param {DemoPacketRaw} demoPacketRaw - DEM_StringTables.
     * @returns {DemoPacketRaw}
     */
    _repackStartTables(demoPacketRaw) {
        return this._codec.repackDemoPacketRaw(demoPacketRaw, this._createStringTablesMessage());
    }
}

export default DemoStreamCutEditor;

/** @import DemoPacketRaw from '../../data/DemoPacketRaw.js' */
/** @import StringTable from '../../data/tables/string/StringTable.js' */

import Assert from '../../core/Assert.js';

import Transform from '#core/stream/Transform.js';

import StreamConfiguration from '../../configurations/StreamConfiguration.js';

import DemoCutIndex from '../../cut/DemoCutIndex.js';

import MessagePacket from '../../data/MessagePacket.js';

import DemoPacketType from '../../data/enums/DemoPacketType.js';
import MessagePacketType from '../../data/enums/MessagePacketType.js';
import StringTableType from '../../data/enums/StringTableType.js';

import StringTableContainer from '../../data/tables/string/StringTableContainer.js';

import PacketCodec from '../../schema/PacketCodec.js';
import StringTableCodec from '../../schema/StringTableCodec.js';

const STRING_TABLE_DEMO_PACKET_TYPE_IDS = new Set([
    DemoPacketType.DEM_PACKET.id,
    DemoPacketType.DEM_SIGNON_PACKET.id,
    DemoPacketType.DEM_STRING_TABLES.id
]);

const STRING_TABLE_MESSAGE_PACKET_TYPE_IDS = new Set([
    MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES.id,
    MessagePacketType.SVC_CREATE_STRING_TABLE.id,
    MessagePacketType.SVC_UPDATE_STRING_TABLE.id
]);

/**
 * Indexes a stream of {@link DemoPacketRaw} for cutting: records packet types and ticks,
 * captures cloned string table snapshots before every full packet.
 */
class DemoStreamCutIndexer extends Transform {
    /** @private @type {PacketCodec} */
    _codec;

    /** @private @type {StringTableContainer} */
    _container = new StringTableContainer();

    /** @private @type {DemoCutIndex|null} */
    _index = null;

    /** @private @type {Map<number, Array<StringTable>>} */
    _keyframes = new Map();

    /** @private @type {StringTableCodec} */
    _tableCodec = new StringTableCodec();

    /** @private @type {Array<number>} */
    _ticks = [ ];

    /** @private @type {Array<number>} */
    _typeIds = [ ];

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
     * Returns the demo index once the stream has finished.
     *
     * @public
     * @returns {DemoCutIndex}
     */
    getIndex() {
        Assert.isTrue(this._index !== null, 'Unable to get the index: the stream has not finished');

        return this._index;
    }

    /**
     * @private
     * @param {*} createData
     */
    _createTable(createData) {
        const existing = this._container.getByName(createData.name);
        const tableId = existing !== null ? existing.id : this._container.size;

        const { table, entries } = this._tableCodec.decodeCreate(createData, tableId, StringTableType.synthesize(createData.name));

        table.registerEntries(entries);

        this._container.register(table);
    }

    /**
     * @protected
     * @returns {Promise<void>}
     */
    async _finalize() {
        this._index = new DemoCutIndex(Uint8Array.from(this._typeIds), Int32Array.from(this._ticks), this._keyframes);

        this._container.clear();

        this._keyframes = new Map();
        this._ticks = [ ];
        this._typeIds = [ ];
    }

    /**
     * @protected
     * @param {DemoPacketRaw} demoPacketRaw
     * @returns {Promise<void>}
     */
    async _handle(demoPacketRaw) {
        this._typeIds.push(demoPacketRaw.getTypeId());
        this._ticks.push(demoPacketRaw.tick.value);

        this._indexStringTables(demoPacketRaw);

        this._push(demoPacketRaw);
    }

    /**
     * @private
     * @param {MessagePacket} messagePacket
     */
    _handleMessage(messagePacket) {
        switch (messagePacket.type) {
            case MessagePacketType.SVC_CLEAR_ALL_STRING_TABLES: {
                this._container.clear();

                break;
            }
            case MessagePacketType.SVC_CREATE_STRING_TABLE: {
                this._createTable(messagePacket.data);

                break;
            }
            case MessagePacketType.SVC_UPDATE_STRING_TABLE: {
                this._updateTable(messagePacket.data);

                break;
            }
            default: {
                break;
            }
        }
    }

    /**
     * @private
     * @param {DemoPacketRaw} demoPacketRaw
     */
    _indexStringTables(demoPacketRaw) {
        if (demoPacketRaw.is(DemoPacketType.DEM_FULL_PACKET)) {
            this._keyframes.set(demoPacketRaw.sequence, this._container.getTables().map(table => table.clone()));

            return;
        }

        if (!STRING_TABLE_DEMO_PACKET_TYPE_IDS.has(demoPacketRaw.getTypeId())) {
            return;
        }

        const demoPacket = this._codec.decodeDemoPacketRaw(demoPacketRaw, getIsStringTableMessage);

        Assert.isTrue(demoPacket !== null, `Unable to read the string tables of packet [ ${demoPacketRaw.sequence} ]`);

        if (demoPacket.is(DemoPacketType.DEM_STRING_TABLES)) {
            this._instantiateTables(demoPacket.data);

            return;
        }

        if (demoPacket.is(DemoPacketType.DEM_PACKET) || demoPacket.is(DemoPacketType.DEM_SIGNON_PACKET)) {
            const messagePackets = demoPacket.data.messagePackets;

            for (let i = 0; i < messagePackets.length; i++) {
                const messagePacket = messagePackets[i];

                if (!(messagePacket instanceof MessagePacket)) {
                    throw new Error(`Unable to read string table message [ ${messagePacket.type} ] of packet [ ${demoPacketRaw.sequence} ]`);
                }

                this._handleMessage(messagePacket);
            }
        }
    }

    /**
     * @private
     * @param {*} instantiateData
     */
    _instantiateTables(instantiateData) {
        const tables = instantiateData.tables;

        for (let i = 0; i < tables.length; i++) {
            const tableData = tables[i];
            const existing = this._container.getByName(tableData.tableName);

            const table = existing !== null
                ? this._tableCodec.createTable(existing.id, existing.type, existing.flags, existing.instructions)
                : this._tableCodec.createTable(this._container.size, StringTableType.synthesize(tableData.tableName), tableData.tableFlags);

            table.registerEntries(this._tableCodec.decodeItems(table, tableData.items));

            this._container.register(table);
        }
    }

    /**
     * @private
     * @param {*} updateData
     */
    _updateTable(updateData) {
        const table = this._container.getById(updateData.tableId);

        Assert.exists(table, `Unknown StringTable [ ${updateData.tableId} ]`);

        table.registerEntries(this._tableCodec.decodeUpdate(table, updateData));
    }
}

/**
 * @param {number} typeId
 * @returns {boolean}
 */
function getIsStringTableMessage(typeId) {
    return STRING_TABLE_MESSAGE_PACKET_TYPE_IDS.has(typeId);
}

export default DemoStreamCutIndexer;

'use strict';

const LoggerProvider = require('./../../../providers/LoggerProvider.instance'),
    ProtoProvider = require('./../../../providers/ProtoProvider.instance');

const BitBuffer = require('../../buffer/BitBufferFast');

const StringTableType = require('./../../enums/StringTableType');

const StringTable = require('./StringTable'),
    StringTableEntry = require('./StringTableEntry');

const SnappyDecompressor = require('../../../decompressors/SnappyDecompressor.instance');

const logger = LoggerProvider.getLogger('StringTableContainer');

const MAX_HISTORY_ENTRIES = 32;

const CMsgPlayerInfo = ProtoProvider.NETWORK_BASE_TYPES.lookupType('CMsgPlayerInfo');
const CModifierTableEntry = ProtoProvider.BASE_MODIFIER.lookupType('CModifierTableEntry');

class StringTableContainer {
    /**
     * @public
     * @constructor
     */
    constructor() {
        this._registry = {
            tableById: new Map(),
            tableByName: new Map()
        };
    }

    /**
     * @public
     *
     * @param {Number} id
     * @returns {StringTable}
     */
    getById(id) {
        return this._registry.tableById.get(id) || null;
    }

    /**
     * @public
     *
     * @param {String} name
     * @returns {StringTable}
     */
    getByName(name) {
        return this._registry.tableByName.get(name) || null;
    }

    /**
     * @public
     */
    handleClear() {
        this._clear();
    }

    /**
     * @public
     *
     * @param {*} createData
     */
    handleCreate(createData) {
        const stringTableType = StringTableType.parseByName(createData.name);

        if (stringTableType === null) {
            logger.warn(`Unknown StringTableType [ ${createData.name} ]`);

            return;
        }

        const stringTable = new StringTable(stringTableType, createData.flags, createData.userDataSizeBits, createData.userDataFixedSize, createData.usingVarintBitcounts);

        this._register(stringTable);

        let payload;

        if (createData.dataCompressed) {
            payload = SnappyDecompressor.decompress(createData.stringData);
        } else {
            payload = createData.stringData;
        }

        const entries = this._parseStringData(stringTable, payload, createData.numEntries);

        entries.forEach((entry) => {
            stringTable.updateEntry(entry);
        });
    }

    /**
     * @public
     *
     * @param {*} updateData
     */
    handleUpdate(updateData) {
        const stringTable = this._registry.tableById.get(updateData.tableId) || null;

        if (stringTable === null) {
            throw new Error(`Unknown StringTable [ ${updateData.tableId} ]`);
        }

        logger.debug(`Updating StringTable: [ ${updateData.tableId} ] [ ${stringTable.type.name} ] [ ${updateData.numChangedEntries} ]`);

        const entries = this._parseStringData(stringTable, updateData.stringData, updateData.numChangedEntries);

        entries.forEach((entry) => {
            stringTable.updateEntry(entry);
        });
    }

    /**
     * @private
     */
    _clear() {
        this._registry.tableByName.clear();
        this._registry.tableById.clear();
    }

    /**
     * @private
     * @param {StringTable} table
     * @param {Buffer|Uint8Array} data
     * @param {number} entriesCount
     *
     * @returns {Array<StringTableEntry>}
     */
    _parseStringData(table, data, entriesCount) {
        const bitBuffer = new BitBuffer(data);

        const entries = [ ];
        const history = [ ];

        let index = -1;

        for (let i = 0; i < entriesCount; i++) {
            let key = '';
            let value = null;

            const increment = bitBuffer.readBit() === 1;

            if (increment) {
                index += 1;
            } else {
                index += bitBuffer.readUVarInt32().value + 2;
            }

            const hasKey = bitBuffer.readBit() === 1;

            if (hasKey) {
                const useHistory = bitBuffer.readBit() === 1;

                if (useHistory) {
                    const offset = bitBuffer.read(5).readUInt8();
                    const size = bitBuffer.read(5).readUInt8();

                    const historicalKey = history[i < MAX_HISTORY_ENTRIES ? offset : i - (MAX_HISTORY_ENTRIES - offset)];

                    const portion = bitBuffer.readString();

                    if (size > historicalKey.length) {
                        key = historicalKey + portion;
                    } else {
                        key = historicalKey.slice(0, size) + portion;
                    }
                } else {
                    key = bitBuffer.readString();
                }
            } // if there is no key?

            history[i] = key;

            const hasValue = bitBuffer.readBit() === 1;

            if (hasValue) {
                let bitSize = 0;
                let isCompressed = false;

                if (table.userDataFixedSize) {
                    bitSize = table.userDataSizeBits;
                } else {
                    if (table.getIsValueCompressionSupported()) {
                        isCompressed = bitBuffer.readBit() === 1;
                    }

                    if (table.usingVarintBitcounts) {
                        bitSize = bitBuffer.readUVarInt() * BitBuffer.BITS_PER_BYTE;
                    } else {
                        const buffer = Buffer.concat([ bitBuffer.read(17), Buffer.alloc(1) ]);

                        bitSize = buffer.readUint32LE() * BitBuffer.BITS_PER_BYTE;
                    }
                }

                value = bitBuffer.read(bitSize);

                if (isCompressed) {
                    value = SnappyDecompressor.decompress(value);
                }

                switch (table.type) {
                    case StringTableType.ACTIVE_MODIFIERS:
                        value = CModifierTableEntry.decode(value);

                        break;
                    case StringTableType.INSTANCE_BASE_LINE:
                        break;
                    case StringTableType.USER_INFO:
                        value = CMsgPlayerInfo.decode(value);

                        break;
                    default:
                        break;
                }
            }

            const entry = new StringTableEntry(index, key, value);

            entries.push(entry);
        }

        return entries;
    }

    /**
     * @private
     * @param {StringTable} stringTable
     */
    _register(stringTable) {
        const id = this._registry.tableById.size;

        logger.debug(`Registering StringTable: [ ${id} ] [ ${stringTable.type.name} ] [ ${stringTable.numEntries} ]`);

        this._registry.tableByName.set(stringTable.type.name, stringTable);
        this._registry.tableById.set(id, stringTable);
    }
}

module.exports = StringTableContainer;

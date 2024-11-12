'use strict';

const StringTableType = require('./../../enums/StringTableType');

const StringTable = require('./StringTable'),
    StringTableEntry = require('./StringTableEntry'),
    StringTableInstructions = require('./StringTableInstructions');

const SnappyDecompressor = require('../../../decompressors/SnappyDecompressor.instance');

const StringTableEntryExtractor = require('./../../../extractors/StringTableEntryExtractor');

const LoggerProvider = require('./../../../providers/LoggerProvider.instance');

const logger = LoggerProvider.getLogger('StringTableContainer');

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
     * @param {CSVCMsg_CreateStringTable} createData
     */
    handleCreate(createData) {
        const stringTableType = StringTableType.parseByName(createData.name);

        if (stringTableType === null) {
            logger.warn(`Unable to identify table [ ${createData.name} ]`);

            return;
        }

        const existing = this.getByName(stringTableType.name);

        if (existing !== null) {
            logger.warn(`StringTable [ ${stringTableType.name} ] exists in the registry. Overwriting`);
        }

        const instructions = new StringTableInstructions(createData.userDataSizeBits, createData.userDataFixedSize, createData.usingVarintBitcounts);

        let payload;

        if (createData.dataCompressed) {
            payload = SnappyDecompressor.decompress(createData.stringData);
        } else {
            payload = createData.stringData;
        }

        const stringTable = new StringTable(stringTableType, createData.flags, [ ], instructions);

        this._register(stringTable);

        const entryExtractor = new StringTableEntryExtractor(payload, stringTable, createData.numEntries);

        const extractor = entryExtractor.retrieve();

        for (const entry of extractor) {
            stringTable.updateEntry(entry);
        }
    }

    /**
     * @public
     * @param {CDemoStringTables} instantiateData
     */
    handleInstantiate(instantiateData) {
        instantiateData.tables.forEach((tableData) => {
            const type = StringTableType.parseByName(tableData.tableName);

            if (type === null) {
                logger.warn(`Unable to identify table [ ${tableData.tableName} ]`);

                return;
            }

            const entries = [ ];

            tableData.items.forEach((entryData, index) => {
                const entry = new StringTableEntry(index, entryData.str, entryData.data);

                entries.push(entry);
            });

            const stringTable = new StringTable(type, tableData.tableFlags, entries, null);

            this._register(stringTable);
        });
    }

    /**
     * @public
     * @param {CSVCMsg_UpdateStringTable} updateData
     */
    handleUpdate(updateData) {
        const stringTable = this._registry.tableById.get(updateData.tableId) || null;

        if (stringTable === null) {
            throw new Error(`Unknown StringTable [ ${updateData.tableId} ]`);
        }

        logger.debug(`Updating StringTable: [ ${updateData.tableId} ] [ ${stringTable.type.name} ] [ ${updateData.numChangedEntries} ]`);

        const entryExtractor = new StringTableEntryExtractor(updateData.stringData, stringTable, updateData.numChangedEntries);

        const extractor = entryExtractor.retrieve();

        for (const entry of extractor) {
            stringTable.updateEntry(entry);
        }
    }

    /**
     * @private
     */
    _clear() {
        logger.debug(`Clearing StringTable registry`);

        this._registry.tableByName.clear();
        this._registry.tableById.clear();
    }

    /**
     * @private
     * @param {StringTable} stringTable
     */
    _register(stringTable) {
        const id = this._registry.tableById.size;

        logger.debug(`Registering StringTable: [ ${id} ] [ ${stringTable.type.name} ]`);

        this._registry.tableByName.set(stringTable.type.name, stringTable);
        this._registry.tableById.set(id, stringTable);
    }
}

module.exports = StringTableContainer;

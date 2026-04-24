import Assert from '#core/Assert.js';
import Logger from '#core/Logger.js';
import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';

import StringTableType from '#data/enums/StringTableType.js';

import StringTableEntryExtractor from '#extractors/StringTableEntryExtractor.js';

import SchemaRegistry from '#src/SchemaRegistry.js';

import StringTable from '#data/tables/string/StringTable.js';
import StringTableContainer from '#data/tables/string/StringTableContainer.js';
import StringTableEntry from '#data/tables/string/StringTableEntry.js';
import StringTableInstructions from '#data/tables/string/StringTableInstructions.js';

/**
 * Translates raw string-table protobuf payloads into
 * {@link StringTable} mutations on a {@link StringTableContainer}.
 *
 * Owns the registry/logger dependencies so the container can remain a
 * pure data structure.
 */
class StringTableHandler {
    /**
     * @public
     * @constructor
     * @param {SchemaRegistry} registry
     * @param {StringTableContainer} container
     * @param {Logger} logger
     */
    constructor(registry, container, logger) {
        Assert.isTrue(registry instanceof SchemaRegistry, 'Invalid registry: expected an instance of SchemaRegistry');
        Assert.isTrue(container instanceof StringTableContainer, 'Invalid container: expected an instance of StringTableContainer');
        Assert.isTrue(logger instanceof Logger, 'Invalid logger: expected an instance of Logger');

        this._registry = registry;
        this._container = container;
        this._logger = logger;
    }

    /**
     * @public
     * @param {CSVCMsg_CreateStringTable} createData
     */
    handleCreate(createData) {
        const stringTableType = this._resolveOrSynthesize(createData.name);

        const existing = this._container.getByName(stringTableType.name);

        if (existing !== null) {
            this._logger.warn(`StringTable [ ${stringTableType.name} ] exists in the registry. Overwriting`);
        }

        const instructions = new StringTableInstructions(
            createData.userDataSizeBits,
            createData.userDataFixedSize,
            createData.usingVarintBitcounts
        );

        const payload = createData.dataCompressed
            ? SnappyDecompressor.decompress(createData.stringData)
            : createData.stringData;

        const tableId = existing !== null ? existing.id : this._container.size;

        const stringTable = new StringTable(tableId, stringTableType, createData.flags, instructions);

        const decoder = this._registry.getStringTableDecoder(stringTable.type);
        const entryExtractor = new StringTableEntryExtractor(payload, stringTable, createData.numEntries, decoder);

        for (const entry of entryExtractor.retrieve()) {
            stringTable.updateEntry(entry);
        }

        this._logger.debug(`Registering StringTable: [ ${stringTable.id} ] [ ${stringTable.type.name} ]`);

        this._container.register(stringTable);
    }

    /**
     * @public
     * @param {CDemoStringTables} instantiateData
     */
    handleInstantiate(instantiateData) {
        instantiateData.tables.forEach((tableData) => {
            const stringTableType = this._resolveOrSynthesize(tableData.tableName);

            const existing = this._container.getByName(stringTableType.name);

            let stringTable;

            if (existing !== null) {
                stringTable = new StringTable(existing.id, stringTableType, tableData.tableFlags, existing.instructions);
            } else {
                stringTable = new StringTable(this._container.size, stringTableType, tableData.tableFlags, null);
            }

            const decoder = this._registry.getStringTableDecoder(stringTable.type);

            tableData.items.forEach((entryData, index) => {
                const entry = StringTableEntry.fromBuffer(decoder, entryData.data, stringTable.type, index, entryData.str);

                stringTable.updateEntry(entry);
            });

            this._logger.debug(`Registering StringTable: [ ${stringTable.id} ] [ ${stringTable.type.name} ]`);

            this._container.register(stringTable);
        });
    }

    /**
     * @public
     * @param {*} snapshotData
     */
    handleSnapshot(snapshotData) {
        snapshotData.tables.forEach((tableData) => {
            const type = this._registry.resolveStringTableTypeByName(tableData.tableName);

            const existingTable = type !== null
                ? this._container.getByName(type.name)
                : null;

            if (existingTable === null) {
                this._logger.warn(`Unable to find a table [ ${tableData.tableName} ]`);

                return;
            }

            const decoder = this._registry.getStringTableDecoder(existingTable.type);

            tableData.items.forEach((entryData, index) => {
                const entry = StringTableEntry.fromBuffer(decoder, entryData.data || null, existingTable.type, index, entryData.str);

                existingTable.updateEntry(entry);
            });

            this._container.markChanged(existingTable);
        });
    }

    /**
     * @public
     * @param {CSVCMsg_UpdateStringTable} updateData
     */
    handleUpdate(updateData) {
        const stringTable = this._container.getById(updateData.tableId);

        if (stringTable === null) {
            throw new Error(`Unknown StringTable [ ${updateData.tableId} ]`);
        }

        this._logger.debug(`Updating StringTable: [ ${updateData.tableId} ] [ ${stringTable.type.name} ] [ ${updateData.numChangedEntries} ]`);

        const decoder = this._registry.getStringTableDecoder(stringTable.type);
        const entryExtractor = new StringTableEntryExtractor(updateData.stringData, stringTable, updateData.numChangedEntries, decoder);

        for (const entry of entryExtractor.retrieve()) {
            stringTable.updateEntry(entry);
        }

        this._container.markUpdated(stringTable);
    }

    /**
     * @public
     */
    handleClear() {
        this._logger.debug('Clearing StringTable registry');

        this._container.clear();
    }

    /**
     * @protected
     * @param {String} name
     * @returns {StringTableType}
     */
    _resolveOrSynthesize(name) {
        let type = this._registry.resolveStringTableTypeByName(name);

        if (type === null) {
            this._logger.warn(`Unknown StringTable [ ${name} ], registering as raw`);

            type = StringTableType.synthesize(name);

            this._registry.registerStringTableType(type);
        }

        return type;
    }
}

export default StringTableHandler;

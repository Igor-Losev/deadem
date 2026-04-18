import Assert from '#core/Assert.js';
import EventEmitter from '#core/EventEmitter.js';
import Logger from '#core/Logger.js';
import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';

import StringTableEvent from '#data/enums/StringTableEvent.js';
import StringTableType from '#data/enums/StringTableType.js';

import StringTableEntryExtractor from '#extractors/StringTableEntryExtractor.js';

import StringTable from './StringTable.js';
import StringTableEntry from './StringTableEntry.js';
import StringTableInstructions from './StringTableInstructions.js';

class StringTableContainer {
    /**
     * @public
     * @constructor
     * @param {Logger} logger
     */
    constructor(logger) {
        Assert.isTrue(logger instanceof Logger);

        this._eventEmitter = new EventEmitter(this);

        this._registry = {
            tableById: new Map(),
            tableByName: new Map()
        };

        this._logger = logger;
    }

    /**
     * @public
     *
     * @param {number} id
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
     * @returns {Array<StringTable>} 
     */
    getTables() {
        return Array.from(this._registry.tableById.values());
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
            this._logger.warn(`Unable to identify table [ ${createData.name} ]`);

            return;
        }

        const existing = this.getByName(stringTableType.name);

        if (existing !== null) {
            this._logger.warn(`StringTable [ ${stringTableType.name} ] exists in the registry. Overwriting`);
        }

        const instructions = new StringTableInstructions(createData.userDataSizeBits, createData.userDataFixedSize, createData.usingVarintBitcounts);

        let payload;

        if (createData.dataCompressed) {
            payload = SnappyDecompressor.decompress(createData.stringData);
        } else {
            payload = createData.stringData;
        }

        let tableId;

        if (existing !== null) {
            tableId = existing.id;
        } else {
            tableId = this._registry.tableById.size;
        }

        const stringTable = new StringTable(tableId, stringTableType, createData.flags, instructions);

        this._register(stringTable);

        const entryExtractor = new StringTableEntryExtractor(payload, stringTable, createData.numEntries);

        const extractor = entryExtractor.retrieve();

        for (const entry of extractor) {
            stringTable.updateEntry(entry);
        }

        this._eventEmitter.fire(StringTableEvent.TABLE_CREATED.name, stringTable);
        this._eventEmitter.fire(StringTableEvent.TABLE_CHANGED.name, stringTable);
    }

    /**
     * @public
     * @param {CDemoStringTables} instantiateData
     */
    handleInstantiate(instantiateData) {
        instantiateData.tables.forEach((tableData) => {
            const stringTableType = StringTableType.parseByName(tableData.tableName);

            if (stringTableType === null) {
                this._logger.warn(`Unable to identify table [ ${tableData.tableName} ]`);

                return;
            }

            const existing = this.getByName(stringTableType.name);

            let stringTable;

            if (existing !== null) {
                stringTable = new StringTable(existing.id, stringTableType, tableData.tableFlags, existing.instructions);
            } else {
                stringTable = new StringTable(this._registry.tableById.size, stringTableType, tableData.tableFlags, null);
            }

            tableData.items.forEach((entryData, index) => {
                const entry = StringTableEntry.fromBuffer(entryData.data, stringTable.type, index, entryData.str);

                stringTable.updateEntry(entry);
            });

            this._register(stringTable);

            this._eventEmitter.fire(StringTableEvent.TABLE_CREATED.name, stringTable);
            this._eventEmitter.fire(StringTableEvent.TABLE_CHANGED.name, stringTable);
        });
    }

    /**
    * @public
    * @param {*} snapshotData 
    */
    handleSnapshot(snapshotData) {
        snapshotData.tables.forEach((tableData) => {
            const type = StringTableType.parseByName(tableData.tableName);

            if (type === null) {
                this._logger.warn(`Unable to identify table [ ${tableData.tableName} ]`);

                return;
            }

            const existingTable = this._registry.tableByName.get(type.name) || null;

            if (existingTable === null) {
                this._logger.warn(`Unable to find a table [ ${type.name} ]`);

                return;
            }

            tableData.items.forEach((entryData, index) => {
                const entry = StringTableEntry.fromBuffer(entryData.data || null, existingTable.type, index, entryData.str);

                existingTable.updateEntry(entry);
            });

            this._eventEmitter.fire(StringTableEvent.TABLE_CHANGED.name, existingTable);
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

        this._logger.debug(`Updating StringTable: [ ${updateData.tableId} ] [ ${stringTable.type.name} ] [ ${updateData.numChangedEntries} ]`);

        const entryExtractor = new StringTableEntryExtractor(updateData.stringData, stringTable, updateData.numChangedEntries);

        const extractor = entryExtractor.retrieve();

        for (const entry of extractor) {
            stringTable.updateEntry(entry);
        }

        this._eventEmitter.fire(StringTableEvent.TABLE_UPDATED.name, stringTable);
        this._eventEmitter.fire(StringTableEvent.TABLE_CHANGED.name, stringTable);
    }

    /**
     * @public
     * @param {StringTableEvent} event
     * @param {Function} callback
     */
    subscribe(event, callback) {
        Assert.isTrue(event instanceof StringTableEvent);
        Assert.isTrue(typeof callback === 'function');

        this._eventEmitter.register(event.name, callback);
    }

    /**
     * @public
     * @param {StringTableEvent} event
     * @param {Function} callback
     */
    unsubscribe(event, callback) {
        Assert.isTrue(event instanceof StringTableEvent);
        Assert.isTrue(typeof callback === 'function');

        this._eventEmitter.unregister(event.name, callback);
    }

    /**
     * @private
     */
    _clear() {
        this._logger.debug('Clearing StringTable registry');

        this._registry.tableById.forEach((stringTable) => {
            this._eventEmitter.fire(StringTableEvent.TABLE_REMOVED.name, stringTable);
        });

        this._registry.tableByName.clear();
        this._registry.tableById.clear();
    }

    /**
     * @private
     * @param {StringTable} stringTable
     */
    _register(stringTable) {
        this._logger.debug(`Registering StringTable: [ ${stringTable.id} ] [ ${stringTable.type.name} ]`);

        this._registry.tableByName.set(stringTable.type.name, stringTable);
        this._registry.tableById.set(stringTable.id, stringTable);
    }

    /**
     * @private
     * @param {StringTable} stringTable
     */  
    _unregister(stringTable) {
        this._registry.tableById.delete(stringTable.id);
        this._registry.tableByName.delete(stringTable.type.name);
    }
}

export default StringTableContainer;

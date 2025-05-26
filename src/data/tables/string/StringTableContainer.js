import EventEmitter from 'node:events';

import Assert from '#core/Assert.js';

import StringTableEvent from './../../enums/StringTableEvent.js';
import StringTableType from './../../enums/StringTableType.js';

import StringTable from './StringTable.js';
import StringTableEntry from './StringTableEntry.js';
import StringTableInstructions from './StringTableInstructions.js';

import SnappyDecompressor from '../../../decompressors/SnappyDecompressor.instance.js';

import StringTableEntryExtractor from './../../../extractors/StringTableEntryExtractor.js';

import Logger from '#core/Logger.js';

class StringTableContainer {
    /**
     * @public
     * @constructor
     * @param {Logger} logger
     */
    constructor(logger) {
        Assert.isTrue(logger instanceof Logger);

        this._eventEmitter = new EventEmitter();

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

        const stringTable = new StringTable(stringTableType, createData.flags, instructions);

        this._register(stringTable);

        const entryExtractor = new StringTableEntryExtractor(payload, stringTable, createData.numEntries);

        const extractor = entryExtractor.retrieve();

        for (const entry of extractor) {
            stringTable.updateEntry(entry);
        }

        this._eventEmitter.emit(StringTableEvent.TABLE_CREATED.name, stringTable);
        this._eventEmitter.emit(StringTableEvent.TABLE_CHANGED.name, stringTable);
    }

    /**
     * @public
     * @param {CDemoStringTables} instantiateData
     */
    handleInstantiate(instantiateData) {
        instantiateData.tables.forEach((tableData) => {
            const type = StringTableType.parseByName(tableData.tableName);

            if (type === null) {
                this._logger.warn(`Unable to identify table [ ${tableData.tableName} ]`);

                return;
            }

            const stringTable = new StringTable(type, tableData.tableFlags, null);

            tableData.items.forEach((entryData, index) => {
                const entry = StringTableEntry.fromBuffer(entryData.data, stringTable.type, index, entryData.str);

                stringTable.updateEntry(entry);
            });

            this._register(stringTable);

            this._eventEmitter.emit(StringTableEvent.TABLE_CREATED.name, stringTable);
            this._eventEmitter.emit(StringTableEvent.TABLE_CHANGED.name, stringTable);
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

        this._eventEmitter.emit(StringTableEvent.TABLE_UPDATED.name, stringTable);
        this._eventEmitter.emit(StringTableEvent.TABLE_CHANGED.name, stringTable);
    }

    /**
     * @public
     * @param {StringTableEvent} event
     * @param {Function} callback
     */
    subscribe(event, callback) {
        Assert.isTrue(event instanceof StringTableEvent);
        Assert.isTrue(typeof callback === 'function');

        this._eventEmitter.addListener(event.name, callback);
    }

    /**
     * @public
     * @param {StringTableEvent} event
     * @param {Function} callback
     */
    unsubscribe(event, callback) {
        Assert.isTrue(event instanceof StringTableEvent);
        Assert.isTrue(typeof callback === 'function');

        this._eventEmitter.removeListener(event.name, callback);
    }

    /**
     * @private
     */
    _clear() {
        this._logger.debug('Clearing StringTable registry');

        this._registry.tableById.forEach((stringTable) => {
            this._eventEmitter.emit(StringTableEvent.TABLE_REMOVED, stringTable);
        });

        this._registry.tableByName.clear();
        this._registry.tableById.clear();
    }

    /**
     * @private
     * @param {StringTable} stringTable
     */
    _register(stringTable) {
        const id = this._registry.tableById.size;

        this._logger.debug(`Registering StringTable: [ ${id} ] [ ${stringTable.type.name} ]`);

        this._registry.tableByName.set(stringTable.type.name, stringTable);
        this._registry.tableById.set(id, stringTable);
    }
}

export default StringTableContainer;

import Assert from '../core/Assert.js';
import Logger from '../core/Logger.js';

import StringTableOperation from '../data/enums/StringTableOperation.js';
import StringTableType from '../data/enums/StringTableType.js';

import StringTableContainer from '../data/tables/string/StringTableContainer.js';
import StringTableMutationEvent from '../data/tables/string/StringTableMutationEvent.js';

import SchemaRegistry from '../schema/SchemaRegistry.js';
import StringTableCodec from '../schema/StringTableCodec.js';

/**
 * Resolves string table types, builds {@link StringTableMutationEvent} via {@link StringTableCodec},
 * and applies them to a {@link StringTableContainer}.
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

        /** @private */
        this._codec = new StringTableCodec(registry);
        /** @private */
        this._registry = registry;
        /** @private */
        this._container = container;
        this._logger = logger;
    }

    /**
     * Applies events from the extract methods to the tables.
     *
     * @public
     * @param {Array<StringTableMutationEvent>} events
     */
    applyEvents(events) {
        for (let i = 0; i < events.length; i++) {
            const event = events[i];

            switch (event.operation) {
                case StringTableOperation.CREATE: {
                    event.table.registerEntries(event.entries);

                    this._container.register(event.table);

                    break;
                }
                case StringTableOperation.UPDATE: {
                    event.table.registerEntries(event.entries);

                    break;
                }
                case StringTableOperation.REMOVE: {
                    this._container.unregister(event.table);

                    break;
                }
            }
        }
    }

    /**
     * Reads a table creation. Does not change the tables.
     *
     * @public
     * @param {*} createData
     * @returns {Array<StringTableMutationEvent>}
     */
    extractCreate(createData) {
        const stringTableType = this._resolveOrSynthesize(createData.name);

        const existing = this._container.getByName(stringTableType.name);

        if (existing !== null) {
            this._logger.warn(`StringTable [ ${stringTableType.name} ] exists in the registry. Overwriting`);
        }

        let tableId;

        if (existing !== null) {
            tableId = existing.id;
        } else {
            tableId = this._container.size;
        }

        const { table, entries } = this._codec.decodeCreate(createData, tableId, stringTableType);

        this._logger.debug(`Registering StringTable: [ ${table.id} ] [ ${table.type.name} ]`);

        return [ new StringTableMutationEvent(StringTableOperation.CREATE, table, entries) ];
    }

    /**
     * Reads the tables of a `DEM_STRING_TABLES` packet. Does not change the tables.
     *
     * @public
     * @param {*} instantiateData
     * @returns {Array<StringTableMutationEvent>}
     */
    extractInstantiate(instantiateData) {
        /** @type {Array<StringTableMutationEvent>} */
        const events = [ ];

        let created = 0;

        for (let i = 0; i < instantiateData.tables.length; i++) {
            const tableData = instantiateData.tables[i];
            const stringTableType = this._resolveOrSynthesize(tableData.tableName);
            const existing = this._container.getByName(stringTableType.name);

            const table = existing !== null
                ? this._codec.createTable(existing.id, stringTableType, existing.flags, existing.instructions)
                : this._codec.createTable(this._container.size + created, stringTableType, tableData.tableFlags, null);

            if (existing === null) {
                created += 1;
            }

            const entries = this._codec.decodeItems(table, tableData.items);

            this._logger.debug(`Registering StringTable: [ ${table.id} ] [ ${table.type.name} ]`);

            events.push(new StringTableMutationEvent(StringTableOperation.CREATE, table, entries));
        }

        return events;
    }

    /**
     * Reads the string tables of a `DEM_FULL_PACKET` snapshot. Does not change the tables.
     *
     * @public
     * @param {*} snapshotData
     * @returns {Array<StringTableMutationEvent>}
     */
    extractSnapshot(snapshotData) {
        /** @type {Array<StringTableMutationEvent>} */
        const events = [ ];

        for (let i = 0; i < snapshotData.tables.length; i++) {
            const tableData = snapshotData.tables[i];
            const type = this._registry.resolveStringTableTypeByName(tableData.tableName);

            const existingTable = type !== null
                ? this._container.getByName(type.name)
                : null;

            if (existingTable === null) {
                this._logger.warn(`Unable to find a table [ ${tableData.tableName} ]`);

                continue;
            }

            events.push(new StringTableMutationEvent(
                StringTableOperation.UPDATE,
                existingTable,
                this._codec.decodeItems(existingTable, tableData.items)
            ));
        }

        return events;
    }

    /**
     * Reads a table update. Does not change the tables.
     *
     * @public
     * @param {*} updateData
     * @returns {Array<StringTableMutationEvent>}
     */
    extractUpdate(updateData) {
        const stringTable = this._container.getById(updateData.tableId);

        if (stringTable === null) {
            throw new Error(`Unknown StringTable [ ${updateData.tableId} ]`);
        }

        this._logger.debug(`Updating StringTable: [ ${updateData.tableId} ] [ ${stringTable.type.name} ] [ ${updateData.numChangedEntries} ]`);

        return [ new StringTableMutationEvent(
            StringTableOperation.UPDATE,
            stringTable,
            this._codec.decodeUpdate(stringTable, updateData)
        ) ];
    }

    /**
     * Reads the removal of all tables. Does not change the tables.
     *
     * @public
     * @returns {Array<StringTableMutationEvent>}
     */
    extractClear() {
        this._logger.debug('Clearing StringTable registry');

        return this._container.getTables().map(stringTable => new StringTableMutationEvent(StringTableOperation.REMOVE, stringTable, [ ]));
    }

    /**
     * @protected
     * @param {string} name
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

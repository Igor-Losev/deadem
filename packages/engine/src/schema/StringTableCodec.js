/** @import StringTableType from '../data/enums/StringTableType.js' */

import Assert from '../core/Assert.js';
import Snappy from '../core/Snappy.instance.js';

import StringTable from '../data/tables/string/StringTable.js';
import StringTableEntry from '../data/tables/string/StringTableEntry.js';
import StringTableInstructions from '../data/tables/string/StringTableInstructions.js';

import StringTableEntryExtractor from '../extractors/StringTableEntryExtractor.js';

import SchemaRegistry from './SchemaRegistry.js';

/**
 * Translates Source 2 string table protobuf payloads into
 * {@link StringTable} and {@link StringTableEntry} instances.
 */
class StringTableCodec {
    /** @private @type {SchemaRegistry|null} */
    _registry;

    /**
     * @public
     * @constructor
     * @param {SchemaRegistry|null} [registry=null] - When omitted, entry values stay raw bytes.
     */
    constructor(registry = null) {
        Assert.isTrue(registry === null || registry instanceof SchemaRegistry, 'Invalid registry: expected an instance of SchemaRegistry or null');

        this._registry = registry;
    }

    /**
     * Converts raw string tables into `CDemoStringTables` message fields.
     *
     * @public
     * @static
     * @param {Array<StringTable>} tables
     * @returns {{ tables: Array<{ tableName: string, tableFlags: number, items: Array<{ str: string, data?: Uint8Array }> }> }}
     */
    static toDemoStringTables(tables) {
        const result = new Array(tables.length);

        for (let i = 0; i < tables.length; i++) {
            const table = tables[i];
            const entries = table.getEntries();
            const items = new Array(entries.length);

            for (let j = 0; j < entries.length; j++) {
                const entry = entries[j];

                Assert.isTrue(entry.id === j, `Unable to convert StringTable [ ${table.type.name} ]: entry [ ${j} ] is missing`);

                const value = entry.value;

                Assert.isTrue(value === null || value instanceof Uint8Array, `Unable to convert StringTable [ ${table.type.name} ]: entry [ ${j} ] is not raw bytes`);

                items[j] = value === null
                    ? { str: entry.key }
                    : { str: entry.key, data: value };
            }

            result[i] = {
                tableName: table.type.name,
                tableFlags: table.flags,
                items
            };
        }

        return { tables: result };
    }

    /**
     * @public
     * @param {number} id
     * @param {StringTableType} type
     * @param {number} flags
     * @param {StringTableInstructions|null} [instructions=null]
     * @returns {StringTable}
     */
    createTable(id, type, flags, instructions = null) {
        const decoder = this._registry !== null ? this._registry.getStringTableDecoder(type) : null;

        return new StringTable(id, type, flags, instructions, decoder);
    }

    /**
     * @public
     * @param {*} createData - `CSVCMsg_CreateStringTable` payload.
     * @param {number} tableId
     * @param {StringTableType} type
     * @returns {{ table: StringTable, entries: Array<StringTableEntry> }}
     */
    decodeCreate(createData, tableId, type) {
        const instructions = new StringTableInstructions(
            createData.userDataSizeBits,
            createData.userDataFixedSize,
            createData.usingVarintBitcounts
        );

        const payload = createData.dataCompressed
            ? Snappy.decompress(createData.stringData)
            : createData.stringData;

        const table = this.createTable(tableId, type, createData.flags, instructions);
        const entries = Array.from(new StringTableEntryExtractor(payload, table, createData.numEntries).retrieve());

        return { table, entries };
    }

    /**
     * @public
     * @param {StringTable} table
     * @param {Array<*>} items - `CDemoStringTables.table_t.items`.
     * @returns {Array<StringTableEntry>}
     */
    decodeItems(table, items) {
        const entries = new Array(items.length);

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            entries[i] = new StringTableEntry(table, i, item.str, normalizeEntryData(item.data));
        }

        return entries;
    }

    /**
     * @public
     * @param {StringTable} table
     * @param {*} updateData - `CSVCMsg_UpdateStringTable` payload.
     * @returns {Array<StringTableEntry>}
     */
    decodeUpdate(table, updateData) {
        return Array.from(new StringTableEntryExtractor(updateData.stringData, table, updateData.numChangedEntries).retrieve());
    }
}

/**
 * @param {Uint8Array|null|undefined} data
 * @returns {Uint8Array|null}
 */
function normalizeEntryData(data) {
    if (!data) {
        return null;
    }

    if (ArrayBuffer.isView(data) || Array.isArray(data)) {
        return data.length > 0 ? data : null;
    }

    return data;
}

export default StringTableCodec;

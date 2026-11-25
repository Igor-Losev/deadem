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
    /** @private @type {SchemaRegistry} */
    _registry;

    /**
     * @public
     * @constructor
     * @param {SchemaRegistry} registry
     */
    constructor(registry) {
        Assert.isTrue(registry instanceof SchemaRegistry, 'Invalid registry: expected an instance of SchemaRegistry');

        this._registry = registry;
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
        return new StringTable(id, type, flags, instructions, this._registry.getStringTableDecoder(type));
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

/** @import StringTableInstructions from '../data/tables/string/StringTableInstructions.js' */

import Assert from '../core/Assert.js';
import BitReader from '../core/BitReader.js';
import Snappy from '../core/Snappy.instance.js';

import StringTable from '../data/tables/string/StringTable.js';
import StringTableEntry from '../data/tables/string/StringTableEntry.js';

const MAX_HISTORY_ENTRIES = 32;

class StringTableEntryExtractor {
    /**
     * @public
     * @constructor
     * @param {Uint8Array} buffer
     * @param {StringTable} table
     * @param {number} entriesCount
     */
    constructor(buffer, table, entriesCount) {
        Assert.isTrue(buffer instanceof Uint8Array);
        Assert.isTrue(table instanceof StringTable);
        Assert.isTrue(Number.isInteger(entriesCount));

        /** @private */
        this._bitReader = new BitReader(buffer);
        /** @private */
        this._table = table;
        /** @private */
        this._entriesCount = entriesCount;
    }

    *retrieve() {
        this._bitReader.reset();

        const instructions = /** @type {StringTableInstructions} */ (this._table.instructions);

        /** @type {Array<string>} */
        const history = new Array(MAX_HISTORY_ENTRIES);

        let index = -1;
        let count = 0;

        for (let i = 0; i < this._entriesCount; i++) {
            let key = '';
            let value = null;

            const increment = this._bitReader.readBit();

            if (increment) {
                index += 1;
            } else {
                index += this._bitReader.readUVarInt32() + 2;
            }

            const hasKey = this._bitReader.readBit();

            if (hasKey) {
                const useHistory = this._bitReader.readBit();

                if (useHistory) {
                    const position = this._bitReader.readBitsAsUInt(5);
                    const size = this._bitReader.readBitsAsUInt(5);
                    const portion = this._bitReader.readString();

                    if (position < Math.min(count, MAX_HISTORY_ENTRIES)) {
                        const oldest = Math.max(0, count - MAX_HISTORY_ENTRIES);

                        key = history[(oldest + position) & (MAX_HISTORY_ENTRIES - 1)].slice(0, size) + portion;
                    } else {
                        key = portion;
                    }
                } else {
                    key = this._bitReader.readString();
                }
            } else {
                const existing = this._table.getEntryById(index);

                if (existing !== null) {
                    key = existing.key;
                }
            }

            history[count & (MAX_HISTORY_ENTRIES - 1)] = key;
            count += 1;

            const hasValue = this._bitReader.readBit();

            if (hasValue) {
                let bitSize = 0;
                let isCompressed = false;

                if (instructions.userDataFixedSize) {
                    bitSize = instructions.userDataSizeBits;
                } else {
                    if (this._table.getIsValueCompressionSupported()) {
                        isCompressed = this._bitReader.readBit();
                    }

                    if (instructions.usingVarintBitcounts) {
                        bitSize = this._bitReader.readUVarInt() * BitReader.BITS_PER_BYTE;
                    } else {
                        bitSize = this._bitReader.readBitsAsUInt(17) * BitReader.BITS_PER_BYTE;
                    }
                }

                value = this._bitReader.read(bitSize, true);

                if (isCompressed) {
                    value = Snappy.decompress(value);
                }
            }

            const entry = new StringTableEntry(this._table, index, key, value);

            yield entry;
        }
    }
}

export default StringTableEntryExtractor;

import Assert from '#core/Assert.js';
import BitBuffer from '#core/BitBuffer.js';
import SnappyDecompressor from '#core/SnappyDecompressor.instance.js';

import StringTable from '#data/tables/string/StringTable.js';
import StringTableEntry from '#data/tables/string/StringTableEntry.js';

const MAX_HISTORY_ENTRIES = 32;

class StringTableEntryExtractor {
    /**
     * @public
     * @constructor
     * @param {Buffer|Uint8Array} buffer
     * @param {StringTable} table
     * @param {number} entriesCount
     */
    constructor(buffer, table, entriesCount) {
        Assert.isTrue(Buffer.isBuffer(buffer) || buffer instanceof Uint8Array);
        Assert.isTrue(table instanceof StringTable);
        Assert.isTrue(Number.isInteger(entriesCount));

        this._bitBuffer = new BitBuffer(buffer);
        this._table = table;
        this._entriesCount = entriesCount;
    }

    *retrieve() {
        this._bitBuffer.reset();

        const history = [ ];

        let index = -1;

        for (let i = 0; i < this._entriesCount; i++) {
            let key = '';
            let value = null;

            const increment = this._bitBuffer.readBit() === 1;

            if (increment) {
                index += 1;
            } else {
                index += this._bitBuffer.readUVarInt32() + 2;
            }

            const hasKey = this._bitBuffer.readBit() === 1;

            if (hasKey) {
                const useHistory = this._bitBuffer.readBit() === 1;

                if (useHistory) {
                    const offset = this._bitBuffer.read(5).readUInt8();
                    const size = this._bitBuffer.read(5).readUInt8();

                    const historicalKey = history[i < MAX_HISTORY_ENTRIES ? offset : i - (MAX_HISTORY_ENTRIES - offset)];

                    const portion = this._bitBuffer.readString();

                    if (size > historicalKey.length) {
                        key = historicalKey + portion;
                    } else {
                        key = historicalKey.slice(0, size) + portion;
                    }
                } else {
                    key = this._bitBuffer.readString();
                }

                history[i] = key;
            }

            const hasValue = this._bitBuffer.readBit() === 1;

            if (hasValue) {
                let bitSize = 0;
                let isCompressed = false;

                if (this._table.instructions.userDataFixedSize) {
                    bitSize = this._table.instructions.userDataSizeBits;
                } else {
                    if (this._table.getIsValueCompressionSupported()) {
                        isCompressed = this._bitBuffer.readBit() === 1;
                    }

                    if (this._table.instructions.usingVarintBitcounts) {
                        bitSize = this._bitBuffer.readUVarInt() * BitBuffer.BITS_PER_BYTE;
                    } else {
                        const bitSizeBuffer = this._bitBuffer.read(17);

                        bitSize = BitBuffer.readUInt32LE(bitSizeBuffer) * BitBuffer.BITS_PER_BYTE;
                    }
                }

                value = this._bitBuffer.read(bitSize, true);

                if (isCompressed) {
                    value = SnappyDecompressor.decompress(value);
                }
            }

            const entry = StringTableEntry.fromBuffer(value, this._table.type, index, key);

            yield entry;
        }
    }
}

export default StringTableEntryExtractor;

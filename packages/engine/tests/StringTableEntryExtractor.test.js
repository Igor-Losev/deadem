import { describe, expect, test } from 'vitest';

import StringTableEntryExtractor from '../src/extractors/StringTableEntryExtractor.js';

import StringTableType from '../src/data/enums/StringTableType.js';

import StringTable from '../src/data/tables/string/StringTable.js';
import StringTableEntry from '../src/data/tables/string/StringTableEntry.js';
import StringTableInstructions from '../src/data/tables/string/StringTableInstructions.js';

describe('StringTableEntryExtractor.retrieve()', () => {
    describe('When an update of an existing entry carries neither a key nor a value', () => {
        const table = new StringTable(0, StringTableType.USER_INFO, 0, new StringTableInstructions(0, false, false));

        table.registerEntry(new StringTableEntry(table, 1, '1', new Uint8Array([ 1, 2, 3 ])));

        const buffer = new Uint8Array([ 0x00, 0x00, 0x00 ]);

        const [ entry ] = Array.from(new StringTableEntryExtractor(buffer, table, 1).retrieve());

        test('It should keep the key of the existing entry', () => {
            expect(entry.id).toBe(1);
            expect(entry.key).toBe('1');
        });

        test('It should clear the value', () => {
            expect(entry.value).toBe(null);
        });
    });
});

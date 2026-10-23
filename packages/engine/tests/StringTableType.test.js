import { describe, expect, test } from 'vitest';

import StringTableType from '../src/data/enums/StringTableType.js';

class GameStringTableType extends StringTableType { }

const gameTable = new GameStringTableType('GAME_TABLE', 'GameTable', 'TestEntry');

describe('StringTableType', () => {
    describe('getAll', () => {
        test('It should return the engine tables without the game ones', () => {
            const types = StringTableType.getAll();

            expect(types).toContain(StringTableType.INSTANCE_BASE_LINE);
            expect(types).not.toContain(gameTable);
        });

        test('It should return the game tables together with the engine ones', () => {
            const types = GameStringTableType.getAll();

            expect(types).toContain(gameTable);
            expect(types).toContain(StringTableType.INSTANCE_BASE_LINE);
        });

        test('It should skip synthesized tables', () => {
            const synthesized = StringTableType.synthesize('runtime_table');

            expect(StringTableType.getAll()).not.toContain(synthesized);
        });
    });
});

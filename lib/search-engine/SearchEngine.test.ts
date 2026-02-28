import { describe, it, expect, beforeEach } from 'vitest';
import { SearchEngine, MediaItem } from './SearchEngine';
import { MEDIA_ITEMS_MOCK_ARRAY } from './__mocks__/media-item-mock';

describe('SearchEngine', () => {
    let engine: SearchEngine;

    beforeEach(() => {
        engine = new SearchEngine();
    });

    describe('addItem / addItems', () => {
        it('adds items correctly and populates index', () => {
            engine.addItems(MEDIA_ITEMS_MOCK_ARRAY);
            // We verify by searching
            const results = engine.search('apple');
            expect(results.length).toBe(2);
            expect(results).toContain('1');
            expect(results).toContain('3');
        });
    });

    describe('search', () => {
        beforeEach(() => {
            engine.addItems(MEDIA_ITEMS_MOCK_ARRAY);
        });

        it('returns empty array for empty query', () => {
            expect(engine.search('')).toEqual([]);
            expect(engine.search('   ')).toEqual([]);
        });

        it('returns empty array for query with no matches', () => {
            expect(engine.search('grape')).toEqual([]);
        });

        it('finds single match', () => {
            const results = engine.search('cherry');
            expect(results).toEqual(['1']);
        });

        it('finds matches with multiple words (AND logic)', () => {
            const results = engine.search('John banana');
            // With AND logic, only item 1 has both "John" and "banana"
            expect(results).toEqual(['1']);
        });

        it('ranks exactly matching tokens higher due to accumulated weights', () => {
            const extraItem: MediaItem = {
                id: "4",
                bildnummer: "apple",
                suchtext: "apple tree apple",
                fotografen: "Mr. Apple",
                datum: "2023-01-01",
                hoehe: "1080"
            };
            engine.addItem(extraItem);

            const results = engine.search('apple');
            expect(results[0]).toBe('4');
            expect(results.length).toBe(3);
        });
    });
});

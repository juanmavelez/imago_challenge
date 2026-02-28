import { describe, it, expect } from 'vitest';
import { buildSearchEngine } from './DataPipeline';
import { RAW_MEDIA_ITEMS_MOCK_ARRAY } from './__mocks__/media-item-mock';

describe('DataPipeline', () => {
    it('builds a SearchEngine from raw items and supports searching', () => {
        const engine = buildSearchEngine(RAW_MEDIA_ITEMS_MOCK_ARRAY);
        expect(engine).toBeDefined();

        // Perform a search
        const resultsSunset = engine.search('sunset');
        expect(resultsSunset).toEqual(['IMG_1']);

        const resultsCity = engine.search('city');
        expect(resultsCity).toEqual(['IMG_2']);

        // "nature" is stripped out as a restriction
        const resultsNature = engine.search('nature');
        expect(resultsNature).toEqual([]);
    });
});

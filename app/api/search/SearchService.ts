import { getStorage } from "@/lib/search-engine/singleton";
import { ProcessedMediaItem } from "@/lib/search-engine/DataProcessor";
import { applyFilters } from "@/app/utils/applyFilters";
import { applySorting } from "@/app/utils/applySorting";
import { applyPagination, PaginatedResult } from "@/app/utils/applyPagination";

export interface SearchOptions {
    query: string;
    page: number;
    limit: number;
    dateSort?: string | null;
    restrictions?: string | null;
    credit?: string | null;
}



export class SearchService {
    public static executeSearch(options: SearchOptions): PaginatedResult<ProcessedMediaItem> {
        const { engine, itemsMap } = getStorage();
        const { query, page, limit, dateSort, restrictions, credit } = options;

        let results: ProcessedMediaItem[] = [];
        if (query) {
            const resultIds = engine.search(query);
            // 2. Hydration (IDs to Objects) only for matched query IDs
            results = resultIds.map(id => itemsMap.get(id)!).filter(Boolean);
        } else {
            // If no query, just grab the values without the intermediate ID mapping
            results = Array.from(itemsMap.values());
        }

        // 3. Post-Search Filtering
        results = applyFilters(results, credit, restrictions);

        // 4. Sorting
        results = applySorting(results, dateSort);

        // 5. Pagination
        return applyPagination(results, page, limit);
    }

}

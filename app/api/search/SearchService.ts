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
    dateStart?: string | null;
    dateEnd?: string | null;
}



export class SearchService {
    public static executeSearch(options: SearchOptions): PaginatedResult<ProcessedMediaItem> {
        const { engine, itemsMap } = getStorage();
        const { query, page, limit, dateSort, restrictions, credit, dateStart, dateEnd } = options;

        let results: ProcessedMediaItem[] = [];
        if (query) {
            const resultIds = engine.search(query);
            results = resultIds.map(id => itemsMap.get(id)!).filter(Boolean);
        } else {
            results = Array.from(itemsMap.values());
        }

        // Post-Search Filtering
        results = applyFilters(results, credit, restrictions, dateStart, dateEnd);

        // Sorting
        results = applySorting(results, dateSort);

        // Pagination
        const paginatedResult = applyPagination(results, page, limit);

        return paginatedResult;
    }

}

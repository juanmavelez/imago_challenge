import { getStorage } from "@/lib/search-engine/singleton";
import { ProcessedMediaItem } from "@/lib/search-engine/DataProcessor";
import { applyFilters } from "./applyFilters";
import { applySorting } from "./applySorting";
import { applyPagination, PaginatedResult } from "./applyPagination";

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

export function executeSearch(options: SearchOptions): PaginatedResult<ProcessedMediaItem> {
    const { engine, itemsMap } = getStorage();
    const { query, page, limit, dateSort, restrictions, credit, dateStart, dateEnd } = options;

    let results: ProcessedMediaItem[] = [];
    if (query) {
        const resultIds = engine.search(query);
        results = resultIds
            .map(id => itemsMap.get(id))
            .filter((item): item is ProcessedMediaItem => item !== undefined);
    } else {
        results = Array.from(itemsMap.values());
    }

    // Post-Search Filtering
    results = applyFilters(results, credit, restrictions, dateStart, dateEnd);

    // Sorting
    results = applySorting(results, dateSort);

    // Pagination
    return applyPagination(results, page, limit);
}

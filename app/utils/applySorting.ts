import { ProcessedMediaItem } from "@/lib/search-engine/DataProcessor";
import { SORT_OPTIONS } from "@/app/constants/sortOptions";

export function applySorting(results: ProcessedMediaItem[], dateSort?: string | null): ProcessedMediaItem[] {
    if (dateSort === SORT_OPTIONS.LATEST) {
        return [...results].sort((a, b) => b.timestamp - a.timestamp);
    } else if (dateSort === SORT_OPTIONS.OLDEST) {
        return [...results].sort((a, b) => a.timestamp - b.timestamp);
    }
    return results; // Return as-is if no valid sort provided
}

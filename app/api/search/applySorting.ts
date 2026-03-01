import { ProcessedMediaItem } from "@/lib/search-engine/DataProcessor";

const SORT_LATEST = "latest";
const SORT_OLDEST = "oldest";

export function applySorting(results: ProcessedMediaItem[], dateSort?: string | null): ProcessedMediaItem[] {
    if (dateSort === SORT_LATEST) {
        return [...results].sort((a, b) => b.timestamp - a.timestamp);
    } else if (dateSort === SORT_OLDEST) {
        return [...results].sort((a, b) => a.timestamp - b.timestamp);
    }
    return results; // Return as-is if no valid sort provided
}

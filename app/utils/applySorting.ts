import { ProcessedMediaItem } from "@/lib/search-engine/DataProcessor";

export function applySorting(results: ProcessedMediaItem[], dateSort?: string | null): ProcessedMediaItem[] {
    if (dateSort === "latest") {
        return [...results].sort((a, b) => b.timestamp - a.timestamp);
    } else if (dateSort === "oldest") {
        return [...results].sort((a, b) => a.timestamp - b.timestamp);
    }
    return results; // Return as-is if no valid sort provided
}

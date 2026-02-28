import { ProcessedMediaItem } from "@/lib/search-engine/DataProcessor";

export function applyFilters(results: ProcessedMediaItem[], credit?: string | null, restrictions?: string | null): ProcessedMediaItem[] {
    let filtered = results;

    if (credit) {
        const credits = credit.split(',').map(c => c.trim().toLowerCase());
        filtered = filtered.filter(item => credits.includes(item.fotografen.toLowerCase()));
    }

    if (restrictions) {
        const reqRestrictions = restrictions.split(',').map(r => r.trim());
        filtered = filtered.filter(item =>
            reqRestrictions.every(req => item.restrictions.includes(req))
        );
    }

    return filtered;
}

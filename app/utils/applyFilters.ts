import { ProcessedMediaItem } from "@/lib/search-engine/DataProcessor";

export function applyFilters(results: ProcessedMediaItem[], credit?: string | null, restrictions?: string | null, dateStart?: string | null, dateEnd?: string | null): ProcessedMediaItem[] {
    let filtered = results;

    if (credit) {
        const credits = credit.split(",").map(c => c.trim().toLowerCase());
        filtered = filtered.filter(item => credits.includes(item.fotografen.toLowerCase()));
    }

    if (restrictions) {
        const reqRestrictions = restrictions.split(",").map(r => r.trim());
        filtered = filtered.filter(item =>
            reqRestrictions.every(req => item.restrictions.includes(req))
        );
    }

    if (dateStart) {
        const startTs = new Date(dateStart).getTime();
        if (!isNaN(startTs)) {
            filtered = filtered.filter(item => item.timestamp >= startTs);
        }
    }

    if (dateEnd) {
        const endDt = new Date(dateEnd);
        endDt.setUTCHours(23, 59, 59, 999);
        const endTs = endDt.getTime();
        if (!isNaN(endTs)) {
            filtered = filtered.filter(item => item.timestamp <= endTs);
        }
    }

    return filtered;
}

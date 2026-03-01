import { ProcessedMediaItem } from "@/lib/search-engine/DataProcessor";

export function applyFilters(results: ProcessedMediaItem[], credit?: string | null, restrictions?: string | null, dateStart?: string | null, dateEnd?: string | null): ProcessedMediaItem[] {
    const credits = credit ? credit.split(",").map(c => c.trim().toLowerCase()) : null;
    const reqRestrictions = restrictions ? restrictions.split(",").map(r => r.trim()) : null;
    const startTs = dateStart ? new Date(dateStart).getTime() : null;
    const endDt = dateEnd ? new Date(dateEnd) : null;
    if (endDt) endDt.setUTCHours(23, 59, 59, 999);
    const endTs = endDt && !isNaN(endDt.getTime()) ? endDt.getTime() : null;

    if (!credits && !reqRestrictions && (!startTs || isNaN(startTs)) && !endTs) {
        return results;
    }

    return results.filter(item => {
        if (credits && !credits.includes(item.fotografen.toLowerCase())) return false;
        if (reqRestrictions && !reqRestrictions.every(req => item.restrictions.includes(req))) return false;
        if (startTs && !isNaN(startTs) && item.timestamp < startTs) return false;
        if (endTs && item.timestamp > endTs) return false;
        return true;
    });
}

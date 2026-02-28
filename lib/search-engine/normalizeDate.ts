/**
 * Normalizes a German date string "DD.MM.YYYY" strictly into standard structures.
 */
export function normalizeDate(dateStr: string): { isoDate: string, timestamp: number } {
    if (!dateStr) return { isoDate: "", timestamp: 0 };

    // Attempt to parse strictly DD.MM.YYYY
    const parts = dateStr.split(".");
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);

        const dateObj = new Date(Date.UTC(year, month, day));
        if (!isNaN(dateObj.getTime())) {
            return {
                isoDate: dateObj.toISOString(),
                timestamp: dateObj.getTime()
            };
        }
    }

    const fallbackObj = new Date(dateStr);
    if (!isNaN(fallbackObj.getTime())) {
        return {
            isoDate: fallbackObj.toISOString(),
            timestamp: fallbackObj.getTime()
        };
    }

    return { isoDate: dateStr, timestamp: 0 };
}

import { MediaItem } from "./SearchEngine";

export interface RawMediaItem {
    suchtext: string;
    bildnummer: string;
    fotografen: string;
    datum: string;
    hoehe: string;
    breite: string;
}

export interface ProcessedMediaItem extends MediaItem {
    restrictions: string[];
    width: number;
    height: number;
    timestamp: number;
}

export class DataProcessor {

    public static processItem(raw: RawMediaItem): ProcessedMediaItem {
        const { cleanText, restrictions } = this.extractRestrictions(raw.suchtext);
        const { isoDate, timestamp } = this.normalizeDate(raw.datum);

        return {
            id: raw.bildnummer, // Using bildnummer as the unique ID
            suchtext: cleanText,
            fotografen: raw.fotografen,
            bildnummer: raw.bildnummer,
            datum: isoDate,
            restrictions,
            width: parseInt(raw.breite, 10) || 0,
            height: parseInt(raw.hoehe, 10) || 0,
            timestamp,
            hoehe: raw.hoehe
        };
    }

    public static processItems(rawItems: RawMediaItem[]): ProcessedMediaItem[] {
        return rawItems.map(item => this.processItem(item));
    }

    private static extractRestrictions(text: string): { cleanText: string, restrictions: string[] } {
        if (!text) return { cleanText: "", restrictions: [] };

        const restrictions: string[] = [];
        // Match anything inside brackets [ ... ]
        const regex = /\[(.*?)\]/g;

        const cleanText = text.replace(regex, (match, group1) => {
            restrictions.push(group1.trim());
            return "";
        }).trim();

        return {
            cleanText: cleanText.replace(/\s+/g, ' '),
            restrictions
        };
    }

    /**
     * Normalizes a German date string "DD.MM.YYYY" strictly into standard structures.
     */
    private static normalizeDate(dateStr: string): { isoDate: string, timestamp: number } {
        if (!dateStr) return { isoDate: "", timestamp: 0 };

        // Attempt to parse strictly DD.MM.YYYY
        const parts = dateStr.split(".");
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // 0-indexed in JS
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
}

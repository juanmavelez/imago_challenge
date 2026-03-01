import { MediaItem } from "./SearchEngine";
import { normalizeDate } from "./normalizeDate";

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
        const { isoDate, timestamp } = normalizeDate(raw.datum);

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

        // 1. Match specific token tags like PUBLICATIONxINxGERxSUIxAUTxONLY
        const restrictionRegex = /\b[A-Z]+(?:x[A-Z]+)+\b/g;
        let cleanText = text.replace(restrictionRegex, (match) => {
            restrictions.push(match);
            return match; // Keep in text so it can be keyword-searched
        });

        // 2. Fallback to extracting bracketed text like [RESTRICTED]
        const bracketRegex = /\[(.*?)\]/g;
        cleanText = cleanText.replace(bracketRegex, (match, group1) => {
            restrictions.push(group1.trim());
            return ""; // Remove brackets from searchable text
        }).trim();

        return {
            cleanText: cleanText.replace(/\s+/g, " "),
            restrictions: Array.from(new Set(restrictions))
        };
    }
}

import { tokenize } from "./tokenize";
import { levenshteinDistance, MAX_FUZZY_DISTANCE } from "./levenshteinDistance";

const FUZZY_PENALTIES: Record<number, number> = {
    0: 1.0,  // Exact match — full score
    1: 0.8,  // 1 edit away (e.g. "michel" → "michael")
    2: 0.5,  // 2 edits away
};
export interface MediaItem {
    id: string; // Assuming an id exists, otherwise 'bildnummer' can be used as the unique identifier
    suchtext: string;
    fotografen: string;
    bildnummer: string;
    datum: string;
    hoehe: string;
}

const WEIGHTS = {
    suchtext: 10,
    fotografen: 5,
    bildnummer: 1,
} as const;

export class SearchEngine {
    private invertedIndexMap: Map<string, Map<string, number>> = new Map();
    private itemsMap: Map<string, MediaItem> = new Map();
    private documentCount: number = 0;

    public addItem(item: MediaItem) {
        this.itemsMap.set(item.id, item);
        this.documentCount++;

        const tokenScores = new Map<string, number>();

        // Get unique tokens per field
        const suchtextTokens = new Set(tokenize(item.suchtext));
        for (const token of suchtextTokens) {
            tokenScores.set(token, (tokenScores.get(token) || 0) + WEIGHTS.suchtext);
        }

        const fotografenTokens = new Set(tokenize(item.fotografen));
        for (const token of fotografenTokens) {
            tokenScores.set(token, (tokenScores.get(token) || 0) + WEIGHTS.fotografen);
        }

        const bildnummerTokens = new Set(tokenize(item.bildnummer));
        for (const token of bildnummerTokens) {
            tokenScores.set(token, (tokenScores.get(token) || 0) + WEIGHTS.bildnummer);
        }


        for (const [token, score] of tokenScores.entries()) {
            if (!this.invertedIndexMap.has(token)) {
                this.invertedIndexMap.set(token, new Map<string, number>());
            }
            this.invertedIndexMap.get(token)!.set(item.id, score);
        }
    }

    public addItems(items: MediaItem[]) {
        for (const item of items) {
            this.addItem(item);
        }
    }

    /**
     * Finds index entries that fuzzy-match the given token.
     * Returns a list of { indexToken, entries, penalty } sorted by distance (best first).
     * Falls back to fuzzy only when no exact match exists.
     */
    private findMatchingEntries(token: string): Array<{
        indexToken: string;
        entries: Map<string, number>;
        penalty: number;
    }> {
        // 1. Try exact match first
        const exact = this.invertedIndexMap.get(token);
        if (exact) {
            return [{ indexToken: token, entries: exact, penalty: 1.0 }];
        }

        // 2. Fuzzy fallback — scan all index keys (cheap for small vocabularies)
        const fuzzyMatches: Array<{
            indexToken: string;
            entries: Map<string, number>;
            penalty: number;
            distance: number;
        }> = [];

        for (const [key, entries] of this.invertedIndexMap) {
            // Quick length check to skip obviously distant keys
            if (Math.abs(key.length - token.length) > MAX_FUZZY_DISTANCE) continue;

            const dist = levenshteinDistance(token, key);
            if (dist > 0 && dist <= MAX_FUZZY_DISTANCE) {
                fuzzyMatches.push({
                    indexToken: key,
                    entries,
                    penalty: FUZZY_PENALTIES[dist] ?? 0,
                    distance: dist,
                });
            }
        }

        // Return closest matches first
        return fuzzyMatches.sort((a, b) => a.distance - b.distance);
    }

    public search(query: string): string[] {
        const queryTokens = tokenize(query);
        if (queryTokens.length === 0) return [];

        const scores = new Map<string, number>();

        const uniqueQueryTokens = Array.from(new Set(queryTokens));
        const requiredTokenCount = uniqueQueryTokens.length;

        const tokenCounts = new Map<string, number>();

        for (const token of uniqueQueryTokens) {
            const matchGroups = this.findMatchingEntries(token);

            for (const { entries, penalty } of matchGroups) {
                const documentFrequency = entries.size;
                const idf = Math.log(this.documentCount / (documentFrequency || 1)) + 1;

                for (const [id, tfScore] of entries.entries()) {
                    const tfIdfScore = tfScore * idf * penalty;
                    scores.set(id, (scores.get(id) || 0) + tfIdfScore);
                    // Only count once per query token (not per fuzzy variant)
                    if (!tokenCounts.has(id) || (tokenCounts.get(id)! < uniqueQueryTokens.indexOf(token) + 1)) {
                        tokenCounts.set(id, (tokenCounts.get(id) || 0) + 1);
                    }
                }
            }
        }

        // Filter and sort IDs by highest matched tokens first, then score descending
        const rankedIds = Array.from(scores.entries())
            .map(([id, score]) => ({
                id,
                score,
                matchedTokens: tokenCounts.get(id) || 0
            }))
            .filter(item => item.matchedTokens > 0) // At least 1 token must match
            .sort((a, b) => {
                if (b.matchedTokens !== a.matchedTokens) {
                    return b.matchedTokens - a.matchedTokens; // More matched tokens rank higher
                }
                return b.score - a.score; // Tie-breaker: TF-IDF score
            })
            .map(item => item.id);

        return rankedIds;
    }
}

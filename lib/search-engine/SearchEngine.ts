import { tokenize } from "./tokenize"

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

    public search(query: string): string[] {
        const queryTokens = tokenize(query);
        if (queryTokens.length === 0) return [];

        const scores = new Map<string, number>();

        /* 
            Updated to use AND logic instead of the MVP OR logic.
            An item must contain all unique tokens in the search query to be returned.
        */
        const uniqueQueryTokens = Array.from(new Set(queryTokens));
        const requiredTokenCount = uniqueQueryTokens.length;

        const tokenCounts = new Map<string, number>();

        for (const token of uniqueQueryTokens) {
            const matchingItems = this.invertedIndexMap.get(token);

            if (matchingItems) {
                // Calculate IDF for this specific token
                const documentFrequency = matchingItems.size;
                // Add 1 to avoid division by zero or negative logs
                const idf = Math.log(this.documentCount / (documentFrequency || 1)) + 1;

                for (const [id, tfScore] of matchingItems.entries()) {
                    // Combine TF and IDF
                    const tfIdfScore = tfScore * idf;
                    scores.set(id, (scores.get(id) || 0) + tfIdfScore);
                    tokenCounts.set(id, (tokenCounts.get(id) || 0) + 1);
                }
            }
        }

        // Filter and sort IDs by highest score descending
        const rankedIds = Array.from(scores.entries())
            .filter(([id]) => tokenCounts.get(id) === requiredTokenCount)
            .sort((a, b) => b[1] - a[1]) // Compare scores descending
            .map(([id]) => id);          // Return only IDs

        return rankedIds;
    }
}

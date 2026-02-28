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
    private itemsMap: Map<string, MediaItem> = new Map()

    public addItem(item: MediaItem) {
        this.itemsMap.set(item.id, item);
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
            NOTE: This is our MVP scoring model constraint.
            It relies purely on adding scoring, the token exists = add points.
            This means that it will have limitations such as:
             "Michael jackson", "Michael jackson dog", "Michael jackson house"
            will get the same score. This wont work for a production working search engine
        */
        for (const token of queryTokens) {
            const matchingItems = this.invertedIndexMap.get(token);

            if (matchingItems) {
                for (const [id, score] of matchingItems.entries()) {
                    scores.set(id, (scores.get(id) || 0) + score);
                }
            }
        }

        // Sort IDs by highest score descending
        const rankedIds = Array.from(scores.entries())
            .sort((a, b) => b[1] - a[1]) // Compare scores descending
            .map(([id]) => id);          // Return only IDs

        return rankedIds;
    }
}

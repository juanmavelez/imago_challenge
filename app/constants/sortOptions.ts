export const SORT_OPTIONS = {
    RELEVANCE: "relevance",
    LATEST: "latest",
    OLDEST: "oldest",
} as const;

export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];

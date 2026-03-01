export const QUERY_PARAMS = {
    QUERY: "query",
    PAGE: "page",
    LIMIT: "limit",
    DATE_SORT: "dateSort",
    CREDIT: "credit",
    DATE_START: "dateStart",
    DATE_END: "dateEnd",
    RESTRICTIONS: "restrictions",
} as const;

// Optional type helper if you want to enforce these exact strings
export type QueryParamKey = typeof QUERY_PARAMS[keyof typeof QUERY_PARAMS];

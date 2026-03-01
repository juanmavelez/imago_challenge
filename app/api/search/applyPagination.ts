export interface PaginatedResult<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export function applyPagination<T>(results: T[], page: number, limit: number): PaginatedResult<T> {
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);

    return {
        items: paginatedResults,
        page,
        limit,
        total,
        totalPages
    };
}

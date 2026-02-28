import { describe, it, expect } from "vitest";
import { applyPagination } from "./applyPagination";

describe("Search API Utils - Pagination", () => {
    const mockData = Array.from({ length: 25 }, (_, i) => i + 1);

    it("should paginate first page correctly", () => {
        const res = applyPagination(mockData, 1, 10);
        expect(res.items.length).toBe(10);
        expect(res.items[0]).toBe(1);
        expect(res.items[9]).toBe(10);
        expect(res.page).toBe(1);
        expect(res.limit).toBe(10);
        expect(res.total).toBe(25);
        expect(res.totalPages).toBe(3);
    });

    it("should paginate middle page correctly", () => {
        const res = applyPagination(mockData, 2, 10);
        expect(res.items.length).toBe(10);
        expect(res.items[0]).toBe(11);
    });

    it("should paginate last page correctly (partial)", () => {
        const res = applyPagination(mockData, 3, 10);
        expect(res.items.length).toBe(5);
        expect(res.items[0]).toBe(21);
    });

    it("should return empty items if out of bounds", () => {
        const res = applyPagination(mockData, 4, 10);
        expect(res.items.length).toBe(0);
    });
});

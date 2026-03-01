import { describe, it, expect } from "vitest";
import { applyFilters } from "./applyFilters";
import { ProcessedMediaItem } from "@/lib/search-engine/DataProcessor";

describe("Search API Utils - Filtering", () => {
    const mockData: ProcessedMediaItem[] = [
        { id: "1", suchtext: "a", fotografen: "John Doe", restrictions: ["NO_SPORTS", "NO_PUB"], bildnummer: "1", datum: "2000-01-01", hoehe: "100", width: 100, height: 100, timestamp: 1000 },
        { id: "2", suchtext: "b", fotografen: "Jane Smith", restrictions: ["NO_SPORTS"], bildnummer: "2", datum: "2000-01-02", hoehe: "100", width: 100, height: 100, timestamp: 2000 },
        { id: "3", suchtext: "c", fotografen: "JOHN DOE", restrictions: [], bildnummer: "3", datum: "2000-01-03", hoehe: "100", width: 100, height: 100, timestamp: 3000 },
    ];

    it("should filter by credit case-insensitively", () => {
        const res = applyFilters(mockData, "john doe", null);
        expect(res.length).toBe(2);
        expect(res.map(r => r.id)).toEqual(["1", "3"]);
    });

    it("should filter by multiple credits", () => {
        const res = applyFilters(mockData, "john doe, jane smith", null);
        expect(res.length).toBe(3);
    });

    it("should filter by single restriction", () => {
        const res = applyFilters(mockData, null, "NO_SPORTS");
        expect(res.length).toBe(2);
        expect(res.map(r => r.id)).toEqual(["1", "2"]);
    });

    it("should filter by multiple restrictions (AND logic)", () => {
        const res = applyFilters(mockData, null, "NO_SPORTS,NO_PUB");
        expect(res.length).toBe(1);
        expect(res[0].id).toBe("1");
    });

    it("should filter by credit and restrictions combined", () => {
        const res = applyFilters(mockData, "jane smith", "NO_SPORTS");
        expect(res.length).toBe(1);
        expect(res[0].id).toBe("2");
    });
});

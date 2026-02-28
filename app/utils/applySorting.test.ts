import { describe, it, expect } from "vitest";
import { applySorting } from "./applySorting";
import { ProcessedMediaItem } from "@/lib/search-engine/DataProcessor";

describe("Search API Utils - Sorting", () => {
    const mockData: ProcessedMediaItem[] = [
        { id: "1", suchtext: "", fotografen: "", restrictions: [], bildnummer: "", datum: "", hoehe: "", width: 0, height: 0, timestamp: 100 },
        { id: "2", suchtext: "", fotografen: "", restrictions: [], bildnummer: "", datum: "", hoehe: "", width: 0, height: 0, timestamp: 300 },
        { id: "3", suchtext: "", fotografen: "", restrictions: [], bildnummer: "", datum: "", hoehe: "", width: 0, height: 0, timestamp: 200 },
    ];

    it("should sort latest (descending)", () => {
        const res = applySorting(mockData, "latest");
        expect(res.map(r => r.id)).toEqual(["2", "3", "1"]);
    });

    it("should sort oldest (ascending)", () => {
        const res = applySorting(mockData, "oldest");
        expect(res.map(r => r.id)).toEqual(["1", "3", "2"]);
    });

    it("should return untouched if sort invalid or null", () => {
        const res = applySorting(mockData, null);
        expect(res.map(r => r.id)).toEqual(["1", "2", "3"]);
    });
});

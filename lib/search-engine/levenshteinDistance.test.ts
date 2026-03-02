import { describe, it, expect } from "vitest";
import { levenshteinDistance } from "./levenshteinDistance";

describe("levenshteinDistance", () => {
    it("returns 0 for identical strings", () => {
        expect(levenshteinDistance("michael", "michael")).toBe(0);
    });

    it("handles empty strings — distance equals the other string's length", () => {
        expect(levenshteinDistance("", "abc")).toBe(3);
        expect(levenshteinDistance("abc", "")).toBe(3);
        expect(levenshteinDistance("", "")).toBe(0);
    });

    it("computes insertion distance (michel → michael = 1 missing 'a')", () => {
        expect(levenshteinDistance("michel", "michael")).toBe(1);
    });

    it("computes substitution distance (cat → bat = 1 swap)", () => {
        expect(levenshteinDistance("cat", "bat")).toBe(1);
    });

    it("computes deletion distance (cats → cat = 1 removal)", () => {
        expect(levenshteinDistance("cats", "cat")).toBe(1);
    });

    it("is symmetric — order of arguments doesn't matter", () => {
        expect(levenshteinDistance("abc", "axc")).toBe(levenshteinDistance("axc", "abc"));
        expect(levenshteinDistance("short", "longer")).toBe(levenshteinDistance("longer", "short"));
    });

    it("computes distance > 2 for very different strings", () => {
        expect(levenshteinDistance("abc", "xyz")).toBe(3);
        expect(levenshteinDistance("hello", "world")).toBe(4);
    });
});

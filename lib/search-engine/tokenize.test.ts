import { describe, it, expect } from "vitest";
import { tokenize } from "./tokenize";

describe("tokenize", () => {
    it("returns empty array for falsy input", () => {
        expect(tokenize("")).toEqual([]);
        expect(tokenize(null as any)).toEqual([]);
        expect(tokenize(undefined as any)).toEqual([]);
    });

    it("extracts normal words correctly, lowercased", () => {
        expect(tokenize("Hello World")).toEqual(["hello", "world"]);
    });

    it("ignores special characters and punctuation", () => {
        expect(tokenize("hello, world! How are you?")).toEqual(["hello", "world", "how", "are", "you"]);
        expect(tokenize("[test] (example) {data}")).toEqual(["test", "example", "data"]);
    });

    it("handles numbers and alphanumeric tokens", () => {
        expect(tokenize("Bildnummer 12345")).toEqual(["bildnummer", "12345"]);
        expect(tokenize("ABC-123")).toEqual(["abc", "123"]);
    });

    it("handles extra whitespaces", () => {
        expect(tokenize("  lots   of   spaces  ")).toEqual(["lots", "of", "spaces"]);
    });

    it("handles German special characters (umlauts)", () => {
        expect(tokenize("München straße Österreich")).toEqual(["münchen", "straße", "österreich"]);
    });
});

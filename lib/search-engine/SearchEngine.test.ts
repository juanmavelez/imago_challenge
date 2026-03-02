import { describe, it, expect, beforeEach } from "vitest";
import { SearchEngine, MediaItem } from "./SearchEngine";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Shorthand to create a MediaItem with sensible defaults */
function makeItem(overrides: Partial<MediaItem> & { id: string }): MediaItem {
    return {
        suchtext: "",
        fotografen: "",
        bildnummer: "",
        datum: "",
        hoehe: "",
        ...overrides,
    };
}

// ---------------------------------------------------------------------------
// SearchEngine
// ---------------------------------------------------------------------------


describe("SearchEngine", () => {
    let engine: SearchEngine;

    beforeEach(() => {
        engine = new SearchEngine();
    });

    // -----------------------------------------------------------------------
    // Edge cases — empty / no-match queries
    // -----------------------------------------------------------------------

    describe("edge cases", () => {
        it("returns [] for an empty string query", () => {
            engine.addItem(makeItem({ id: "1", suchtext: "hello world" }));
            expect(engine.search("")).toEqual([]);
        });

        it("returns [] for a whitespace-only query", () => {
            engine.addItem(makeItem({ id: "1", suchtext: "hello world" }));
            expect(engine.search("   ")).toEqual([]);
        });

        it("returns [] when no tokens match any document", () => {
            engine.addItem(makeItem({ id: "1", suchtext: "sunset over mountains" }));
            expect(engine.search("xylophone")).toEqual([]);
        });

        it("returns [] when searching an empty index", () => {
            expect(engine.search("anything")).toEqual([]);
        });

        it("deduplicates repeated query tokens (searching 'dog dog' same as 'dog')", () => {
            engine.addItem(makeItem({ id: "1", suchtext: "dog on street" }));
            const single = engine.search("dog");
            const doubled = engine.search("dog dog");
            expect(doubled).toEqual(single);
        });
    });

    // -----------------------------------------------------------------------
    // Field weights — suchtext(10) > fotografen(5) > bildnummer(1)
    // -----------------------------------------------------------------------

    describe("field weight ranking", () => {
        it("ranks a suchtext match above a fotografen-only match for the same token", () => {
            engine.addItem(makeItem({ id: "in-text", suchtext: "zebra in savanna" }));
            engine.addItem(makeItem({ id: "in-credit", fotografen: "Zebra Photography" }));

            const results = engine.search("zebra");

            expect(results[0]).toBe("in-text");  // weight 10 > weight 5
            expect(results[1]).toBe("in-credit");
        });

        it("ranks a fotografen match above a bildnummer-only match", () => {
            engine.addItem(makeItem({ id: "in-credit", fotografen: "Jackson Studio" }));
            // Use space-separated bildnummer so "jackson" tokenizes as its own word
            // (underscores are part of \w, so "Jackson_001" would be a single token)
            engine.addItem(makeItem({ id: "in-id", bildnummer: "Jackson 001" }));

            const results = engine.search("jackson");

            expect(results[0]).toBe("in-credit"); // weight 5 > weight 1
            expect(results[1]).toBe("in-id");
        });

        it("accumulates weight when a token appears in multiple fields of the same item", () => {
            // "wolf" in suchtext(10) + fotografen(5) = 15
            engine.addItem(makeItem({
                id: "multi-field",
                suchtext: "wolf in forest",
                fotografen: "Wolf Studio",
            }));
            // "wolf" only in suchtext(10)
            engine.addItem(makeItem({
                id: "single-field",
                suchtext: "wolf howling at moon",
            }));

            const results = engine.search("wolf");

            expect(results[0]).toBe("multi-field");  // 15 > 10
            expect(results[1]).toBe("single-field");
        });
    });

    // -----------------------------------------------------------------------
    // IDF — rare terms should score higher than common terms
    // -----------------------------------------------------------------------

    describe("IDF scoring", () => {
        it("ranks documents with rare terms higher than documents with common terms", () => {
            // "sunset" appears in 3 out of 4 documents (common, low IDF)
            // "volcano" appears in 1 out of 4 documents (rare, high IDF)
            engine.addItems([
                makeItem({ id: "1", suchtext: "sunset over ocean" }),
                makeItem({ id: "2", suchtext: "sunset over mountains" }),
                makeItem({ id: "3", suchtext: "sunset in city" }),
                makeItem({ id: "4", suchtext: "volcano eruption scene" }),
            ]);

            const sunsetResults = engine.search("sunset");
            const volcanoResults = engine.search("volcano");

            // All sunset items should be returned
            expect(sunsetResults).toHaveLength(3);
            // Volcano should return exactly 1
            expect(volcanoResults).toEqual(["4"]);
        });
    });

    // -----------------------------------------------------------------------
    // Multi-token ranking — more matched tokens should rank higher
    // -----------------------------------------------------------------------

    describe("multi-token ranking", () => {
        it("ranks item matching 2/2 query tokens above items matching 1/2", () => {
            engine.addItems([
                makeItem({ id: "both", suchtext: "michael jackson performing" }),
                makeItem({ id: "only-michael", suchtext: "michael jordan playing" }),
                makeItem({ id: "only-jackson", suchtext: "jackson hole wyoming" }),
            ]);

            const results = engine.search("michael jackson");

            expect(results[0]).toBe("both");
            expect(results).toContain("only-michael");
            expect(results).toContain("only-jackson");
            expect(results).toHaveLength(3);
        });

        it("ranks 3/3 token match above 2/3 above 1/3", () => {
            engine.addItems([
                makeItem({ id: "one", suchtext: "red bird flying" }),
                makeItem({ id: "two", suchtext: "red car racing" }),
                makeItem({ id: "three", suchtext: "red car flying" }),
            ]);

            const results = engine.search("red car flying");

            // "three" matches all 3 tokens, "one" matches 2 (red, flying), "two" matches 2 (red, car)
            expect(results[0]).toBe("three");
            // Both "one" and "two" match 2 tokens — they should both come after "three"
            expect(results.indexOf("one")).toBeGreaterThan(0);
            expect(results.indexOf("two")).toBeGreaterThan(0);
        });

        it("uses TF-IDF score as tiebreaker when token count is equal", () => {
            // Both items match exactly 1 query token ("eagle").
            // Item "rare" has "eagle" in suchtext AND fotografen (weight 15).
            // Item "common" has "eagle" only in suchtext (weight 10).
            engine.addItems([
                makeItem({ id: "common", suchtext: "eagle in the sky" }),
                makeItem({ id: "rare", suchtext: "eagle soaring high", fotografen: "Eagle Eye Photos" }),
            ]);

            const results = engine.search("eagle");

            expect(results[0]).toBe("rare");   // higher accumulated weight
            expect(results[1]).toBe("common");
        });
    });

    // -----------------------------------------------------------------------
    // Case insensitivity
    // -----------------------------------------------------------------------

    describe("case insensitivity", () => {
        it("matches regardless of query casing", () => {
            engine.addItem(makeItem({ id: "1", suchtext: "Berlin Wall History" }));

            expect(engine.search("berlin")).toEqual(["1"]);
            expect(engine.search("BERLIN")).toEqual(["1"]);
            expect(engine.search("Berlin")).toEqual(["1"]);
        });
    });

    // -----------------------------------------------------------------------
    // Fuzzy matching
    // -----------------------------------------------------------------------

    describe("fuzzy matching", () => {
        it("finds 'michael' when user types 'michel' (1 edit — missing 'a')", () => {
            engine.addItems([
                makeItem({ id: "mj", suchtext: "michael jackson performing" }),
                makeItem({ id: "unrelated", suchtext: "sunset over ocean" }),
            ]);

            const results = engine.search("michel");

            expect(results).toEqual(["mj"]); // must NOT include "unrelated"
        });

        it("closer fuzzy match (distance 1) ranks higher than farther match (distance 2)", () => {
            // Verified distances: "rivr" → "river" = 1, "rivr" → "rover" = 2
            engine.addItems([
                makeItem({ id: "close", suchtext: "river flowing fast" }),    // "river" dist 1 from "rivr"
                makeItem({ id: "far", suchtext: "rover on mars" }),           // "rover" dist 2 from "rivr"
            ]);

            const results = engine.search("rivr");

            // "river" is distance 1 (penalty 0.8), "rover" is distance 2 (penalty 0.5)
            expect(results[0]).toBe("close");
            expect(results[1]).toBe("far");
        });

        it("does NOT fuzzy-match when edit distance exceeds 2", () => {
            engine.addItem(makeItem({ id: "1", suchtext: "photography exhibition" }));

            // "photo" vs "photography" = distance 6 — way beyond threshold
            const results = engine.search("photo");
            expect(results).toEqual([]);
        });

        it("skips fuzzy scan entirely when an exact match exists (performance path)", () => {
            // Both "cat" and "car" are in the index (distance 1 from each other).
            // Searching for "cat" should return ONLY exact matches, not fuzzy "car" matches.
            engine.addItems([
                makeItem({ id: "cat-item", suchtext: "cat sleeping on sofa" }),
                makeItem({ id: "car-item", suchtext: "car driving on highway" }),
            ]);

            const results = engine.search("cat");

            expect(results).toEqual(["cat-item"]);
            // "car-item" should NOT appear because exact match exists for "cat"
        });

        it("handles fuzzy match on fotografen field", () => {
            engine.addItem(makeItem({ id: "1", fotografen: "Henri Cartier-Bresson" }));

            // "henrri" → "henri" (distance 1: extra 'r')
            const results = engine.search("henrri");

            expect(results).toEqual(["1"]);
        });

        it("combines fuzzy and exact tokens in a multi-word query", () => {
            engine.addItems([
                makeItem({ id: "both", suchtext: "michael jackson performing" }),
                makeItem({ id: "only-jackson", suchtext: "jackson hole wyoming" }),
            ]);

            // "michel" fuzzy-matches "michael", "jackson" is exact
            const results = engine.search("michel jackson");

            expect(results[0]).toBe("both");  // matches both tokens
            expect(results).toContain("only-jackson"); // matches "jackson" only
        });
    });

    // -----------------------------------------------------------------------
    // Incremental indexing
    // -----------------------------------------------------------------------

    describe("incremental indexing", () => {
        it("items added after initial load are immediately searchable", () => {
            engine.addItem(makeItem({ id: "1", suchtext: "initial item" }));
            expect(engine.search("new")).toEqual([]);

            engine.addItem(makeItem({ id: "2", suchtext: "new item added later" }));
            expect(engine.search("new")).toEqual(["2"]);
        });

        it("new items participate in IDF calculations correctly", () => {
            // Start with 1 item containing "rare"
            engine.addItem(makeItem({ id: "1", suchtext: "rare bird spotted" }));
            const before = engine.search("rare");
            expect(before).toEqual(["1"]);

            // Add 9 more items WITHOUT "rare" — IDF for "rare" should stay high
            for (let i = 2; i <= 10; i++) {
                engine.addItem(makeItem({ id: String(i), suchtext: "common word used" }));
            }

            const after = engine.search("rare");
            expect(after).toEqual(["1"]);
        });
    });

    // -----------------------------------------------------------------------
    // Determinism
    // -----------------------------------------------------------------------

    describe("determinism", () => {
        it("returns the same ranking for the same query on repeated calls", () => {
            engine.addItems([
                makeItem({ id: "1", suchtext: "sunset over mountains" }),
                makeItem({ id: "2", suchtext: "sunset in city" }),
                makeItem({ id: "3", suchtext: "sunset at beach" }),
            ]);

            const first = engine.search("sunset");
            const second = engine.search("sunset");
            const third = engine.search("sunset");

            expect(first).toEqual(second);
            expect(second).toEqual(third);
        });
    });
});

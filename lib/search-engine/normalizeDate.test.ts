import { describe, it, expect } from "vitest";
import { normalizeDate } from "./normalizeDate";

describe("normalizeDate", () => {
    it("parses valid DD.MM.YYYY correctly", () => {
        const result = normalizeDate("15.08.2023");
        expect(result.isoDate).toBe("2023-08-15T00:00:00.000Z");
        expect(result.timestamp).toBe(new Date(Date.UTC(2023, 7, 15)).getTime());
    });

    it("falls back to standard Date parsing if format is not DD.MM.YYYY", () => {
        const dateStr = "2023-12-01T10:00:00Z";
        const result = normalizeDate(dateStr);
        expect(result.isoDate).toBe("2023-12-01T10:00:00.000Z");
        expect(result.timestamp).toBe(new Date("2023-12-01T10:00:00Z").getTime());
    });

    it("returns empty/zero values for empty strings", () => {
        const result = normalizeDate("");
        expect(result.isoDate).toBe("");
        expect(result.timestamp).toBe(0);
    });

    it("returns the input string and timestamp 0 for completely invalid dates", () => {
        const result = normalizeDate("invalid-date-string");
        expect(result.isoDate).toBe("invalid-date-string");
        expect(result.timestamp).toBe(0);
    });

    it("handles incorrectly formatted dots (e.g. out of bounds dates) that fallback to standard parser or return invalid", () => {
        // '99.99.9999' -> Date.UTC(9999, 98, 99) is technically valid in JS, handling depends on Date bounds
        // Let's test a simple invalid one
        const result = normalizeDate("not.a.date");
        expect(result.isoDate).toBe("not.a.date");
        expect(result.timestamp).toBe(0);
    });
});

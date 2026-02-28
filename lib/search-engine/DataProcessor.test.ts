import { describe, it, expect } from "vitest";
import { DataProcessor, RawMediaItem } from "./DataProcessor";
import { RAW_MEDIA_ITEM_MOCK_1 } from "./__mocks__/media-item-mock";

describe("DataProcessor", () => {
    describe("processItem", () => {
        it("normalizes valid raw item correctly", () => {
            const processed = DataProcessor.processItem(RAW_MEDIA_ITEM_MOCK_1);

            expect(processed).toEqual({
                id: "IMG_123",
                bildnummer: "IMG_123",
                fotografen: "John Doe",
                suchtext: "A beautiful scenery",
                restrictions: ["nature", "sunset"],
                width: 1920,
                height: 1080,
                datum: "2023-08-15T00:00:00.000Z",
                timestamp: new Date(Date.UTC(2023, 7, 15)).getTime(),
                hoehe: "1080"
            });
        });

        it("handles missing or malformed measurements", () => {
            const rawItem: RawMediaItem = {
                suchtext: "Test",
                bildnummer: "IMG_2",
                fotografen: "Jane",
                datum: "",
                hoehe: "invalid",
                breite: ""
            };

            const processed = DataProcessor.processItem(rawItem);
            expect(processed.width).toBe(0);
            expect(processed.height).toBe(0);
        });

        it("handles date parsing fallback when not DD.MM.YYYY", () => {
            const rawItem: RawMediaItem = {
                suchtext: "Test",
                bildnummer: "IMG_3",
                fotografen: "Jane",
                datum: "2023-12-01T10:00:00Z",
                hoehe: "100",
                breite: "100"
            };

            const processed = DataProcessor.processItem(rawItem);
            expect(processed.datum).toBe("2023-12-01T10:00:00.000Z");
            expect(processed.timestamp).toBe(new Date("2023-12-01T10:00:00Z").getTime());
        });

        it("handles empty date string", () => {
            const rawItem: RawMediaItem = {
                suchtext: "Test",
                bildnummer: "IMG_4",
                fotografen: "Jane",
                datum: "",
                hoehe: "100",
                breite: "100"
            };

            const processed = DataProcessor.processItem(rawItem);
            expect(processed.datum).toBe("");
            expect(processed.timestamp).toBe(0);
        });

        it("handles suchtext without restrictions", () => {
            const rawItem: RawMediaItem = {
                suchtext: "Just text no brackets",
                bildnummer: "IMG_5",
                fotografen: "Jane",
                datum: "01.01.2000",
                hoehe: "10",
                breite: "10"
            };

            const processed = DataProcessor.processItem(rawItem);
            expect(processed.suchtext).toBe("Just text no brackets");
            expect(processed.restrictions).toEqual([]);
        });
    });

    describe("processItems", () => {
        it("processes multiple items", () => {
            const rawItems: RawMediaItem[] = [
                { suchtext: "Item 1", bildnummer: "1", fotografen: "A", datum: "01.01.2020", hoehe: "10", breite: "10" },
                { suchtext: "Item 2", bildnummer: "2", fotografen: "B", datum: "02.01.2020", hoehe: "20", breite: "20" }
            ];

            const processed = DataProcessor.processItems(rawItems);
            expect(processed.length).toBe(2);
            expect(processed[0].id).toBe("1");
            expect(processed[1].id).toBe("2");
        });
    });
});

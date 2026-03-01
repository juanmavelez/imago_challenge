import { SearchEngine } from "./SearchEngine";
import { DataProcessor, RawMediaItem, ProcessedMediaItem } from "./DataProcessor";
import rawData from "@/data/data.json";

// Global variable to persist the engine across hot-reloads in development
let engineInstance: SearchEngine | null = null;
let itemsCache: Map<string, ProcessedMediaItem> | null = null;

export function getStorage() {
    if (!engineInstance) {
        const processed = DataProcessor.processItems(rawData as RawMediaItem[]);

        engineInstance = new SearchEngine();
        engineInstance.addItems(processed);

        itemsCache = new Map();
        for (const item of processed) {
            itemsCache.set(item.id, item);
        }
    }

    return { engine: engineInstance, itemsMap: itemsCache! };
}

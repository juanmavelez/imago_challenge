import { SearchEngine } from './SearchEngine';
import { buildSearchEngine } from './DataPipeline';
import rawData from "@/data/data.json";
import { RawMediaItem, ProcessedMediaItem } from './DataProcessor';

// Global variable to persist the engine across hot-reloads in development
let engineInstance: SearchEngine | null = null;
let itemsCache: Map<string, ProcessedMediaItem> | null = null;

export function getStorage() {
    if (!engineInstance) {
        console.log("Initializing Search Engine with", rawData.length, "items");
        engineInstance = buildSearchEngine(rawData as RawMediaItem[]);
        itemsCache = new Map();

        const { DataProcessor } = require('./DataProcessor');
        const processed = DataProcessor.processItems(rawData as RawMediaItem[]);
        for (const item of processed) {
            itemsCache.set(item.id, item);
        }
    }

    return { engine: engineInstance, itemsMap: itemsCache! };
}

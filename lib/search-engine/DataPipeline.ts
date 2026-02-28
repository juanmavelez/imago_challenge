import { SearchEngine } from "./SearchEngine";
import { DataProcessor, RawMediaItem, ProcessedMediaItem } from "./DataProcessor";


export function buildSearchEngine(rawItems: RawMediaItem[]): SearchEngine {
    const cleanItems: ProcessedMediaItem[] = DataProcessor.processItems(rawItems);
    const engine = new SearchEngine();
    engine.addItems(cleanItems);

    return engine;
}

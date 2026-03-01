import fs from "fs";
import path from "path";

export interface AnalyticsStats {
    totalSearches: number;
    averageResponseTimeMs: number;
    popularKeywords: Array<{ keyword: string; count: number }>;
}

// Internal structure for the JSON file
interface AnalyticsData {
    totalSearches: number;
    recentResponseTimes: number[];
    keywordFrequencies: Record<string, number>;
}

// Use a data folder at the project root to persist across reloads
// Alternatively, could use /tmp/analytics.json for temporary local but project root is better here
const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "analytics.json");
const MAX_RESPONSE_TIMES = 1000;

const DEFAULT_DATA: AnalyticsData = {
    totalSearches: 0,
    recentResponseTimes: [],
    keywordFrequencies: {},
};

export class AnalyticsStore {
    private static loadData(): AnalyticsData {
        try {
            if (fs.existsSync(FILE_PATH)) {
                const raw = fs.readFileSync(FILE_PATH, "utf-8");
                return JSON.parse(raw);
            }
        } catch (error) {
            console.error("Failed to read analytics file, using default", error);
        }
        return DEFAULT_DATA;
    }

    private static saveData(data: AnalyticsData): void {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }
            fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
        } catch (error) {
            console.error("Failed to save analytics file:", error);
        }
    }

    public static trackSearch(query: string, durationMs: number): void {
        const data = this.loadData();

        data.totalSearches += 1;

        console.log("TRACKING")
        data.recentResponseTimes.push(durationMs);
        if (data.recentResponseTimes.length > MAX_RESPONSE_TIMES) {
            // remove the oldest elements to stay at max limit
            data.recentResponseTimes = data.recentResponseTimes.slice(-MAX_RESPONSE_TIMES);
        }

        // Track keyword if it exists
        if (query && query.trim() !== "") {
            const normalizedQuery = query.trim().toLowerCase();
            data.keywordFrequencies[normalizedQuery] = (data.keywordFrequencies[normalizedQuery] || 0) + 1;
        }

        this.saveData(data);
    }

    public static getStats(): AnalyticsStats {
        const data = this.loadData();

        // Calculate average response time
        const totalDuration = data.recentResponseTimes.reduce((acc, curr) => acc + curr, 0);
        const averageResponseTimeMs = data.recentResponseTimes.length > 0
            ? totalDuration / data.recentResponseTimes.length
            : 0;

        // Get top 10 most popular keywords
        const popularKeywords = Object.entries(data.keywordFrequencies)
            .map(([keyword, count]) => ({ keyword, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            totalSearches: data.totalSearches,
            averageResponseTimeMs: Math.round(averageResponseTimeMs * 100) / 100,
            popularKeywords,
        };
    }
}

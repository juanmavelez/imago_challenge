import React from "react";
import { ResultsGrid } from "./ResultsGrid";
import { Pagination } from "./Pagination";
import { ProcessedMediaItem } from "@/lib/search-engine/DataProcessor";

interface MainResultsProps {
    total: number;
    results: ProcessedMediaItem[];
    totalPages: number;
    query?: string;
}

export const MainResults: React.FC<MainResultsProps> = ({ total, results, totalPages, query }) => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <h2 className="text-xl font-semibold">Results ({total})</h2>
            </div>

            <ResultsGrid results={results} query={query} />
            <Pagination totalPages={totalPages} />
        </div>
    );
};

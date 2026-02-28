import React from "react";
import { ResultsGrid } from "./ResultsGrid";
import { Pagination } from "./Pagination";
import { ProcessedMediaItem } from "@/lib/search-engine/DataProcessor";

interface MainResultsProps {
    total: number;
    results: ProcessedMediaItem[];
    totalPages: number;
}

export const MainResults: React.FC<MainResultsProps> = ({ total, results, totalPages }) => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end">
                <h2 className="text-xl font-semibold">Results ({total})</h2>
            </div>

            <ResultsGrid results={results} />
            <Pagination totalPages={totalPages} />
        </div>
    );
};

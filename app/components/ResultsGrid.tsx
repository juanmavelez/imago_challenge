import React from "react";
import { ProcessedMediaItem } from "@/lib/search-engine/DataProcessor";

interface ResultsGridProps {
    results: ProcessedMediaItem[];
}

export const ResultsGrid: React.FC<ResultsGridProps> = ({ results }) => {
    if (results.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-900 border border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-12 text-center text-gray-500">
                No images found. Adjust your search or filters.
            </div>
        );
    }

    return (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item) => (
                <li key={item.id} className="group flex h-full">
                    <article className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:shadow-xl transition-all flex flex-col w-full">
                        <div className="h-48 bg-gray-200 dark:bg-zinc-800 relative w-full flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-sm">
                                <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">View Details</span>
                            </div>
                            <span className="text-4xl text-gray-400 dark:text-zinc-600 font-bold opacity-50">{item.bildnummer}</span>
                        </div>
                        <div className="p-5 flex flex-col flex-1 gap-3">
                            <header className="flex justify-between items-start">
                                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                    {item.fotografen}
                                </span>
                                <time className="text-xs text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-lg line-clamp-1">{new Date(item.datum).toLocaleDateString()}</time>
                            </header>
                            <p className="text-sm font-medium line-clamp-2 mt-1 leading-snug">
                                {item.suchtext}
                            </p>
                            <footer className="mt-auto pt-4 flex flex-wrap gap-2">
                                {item.restrictions?.map(r => (
                                    <span key={r} className="text-[10px] bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-0.5 rounded-sm">
                                        {r}
                                    </span>
                                ))}
                            </footer>
                        </div>
                    </article>
                </li>
            ))}
        </ul>
    );
}

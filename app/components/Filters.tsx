"use client";

import React from "react";
import { useFilters } from "@/app/hooks/useFilters";
import { FilterSelect } from "@/app/components/FilterSelect";
import { FilterDate } from "@/app/components/FilterDate";
import { QUERY_PARAMS } from "@/app/constants/queryParams";
import { SORT_OPTIONS } from "@/app/constants/sortOptions";

export const Filters: React.FC = () => {
    const {
        dateSort, selectedCredit, dateStart, dateEnd, restrictions,
        hasFilters, handleFilterChange, handleClearFilters
    } = useFilters();

    return (
        <form
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:flex xl:flex-row gap-4 items-end bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 rounded-lg shadow-sm transition-colors"
            onSubmit={(e) => e.preventDefault()}
        >
            <FilterSelect
                label="Sort by Date"
                value={dateSort}
                onChange={(val) => handleFilterChange(QUERY_PARAMS.DATE_SORT, val)}
                options={[
                    { value: SORT_OPTIONS.LATEST, label: "Latest first" },
                    { value: SORT_OPTIONS.OLDEST, label: "Oldest first" }
                ]}
            />

            {/* The photographer list should come from the backend */}
            <FilterSelect
                label="Photographer"
                value={selectedCredit}
                onChange={(val) => handleFilterChange(QUERY_PARAMS.CREDIT, val)}
                options={[
                    { value: "", label: "All" },
                    { value: "John Doe", label: "John Doe" },
                    { value: "Jane Smith", label: "Jane Smith" },
                    { value: "Ansel Adams", label: "Ansel Adams" },
                    { value: "Imogen Cunningham", label: "Imogen Cunningham" },
                    { value: "Henri Cartier-Bresson", label: "Henri Cartier-Bresson" }
                ]}
            />

            <FilterDate
                label="From Date"
                value={dateStart}
                onChange={(val) => handleFilterChange(QUERY_PARAMS.DATE_START, val)}
            />

            <FilterDate
                label="To Date"
                value={dateEnd}
                onChange={(val) => handleFilterChange(QUERY_PARAMS.DATE_END, val)}
            />



            {/* The Restrictions list should come from the backend */}
            <FilterSelect
                label="Restrictions"
                value={restrictions}
                onChange={(val) => handleFilterChange(QUERY_PARAMS.RESTRICTIONS, val)}
                className="xl:flex-1"
                options={[
                    { value: "", label: "No Restrictions Filtered" },
                    { value: "auto", label: "Auto" },
                    { value: "music", label: "Music" },
                    { value: "nature", label: "Nature" },
                    { value: "science", label: "Science" },
                    { value: "sports", label: "Sports" },
                    { value: "politics", label: "Politics" },
                    { value: "dog", label: "Dog" }
                ]}
            />

            <div className="flex flex-col gap-1 w-full xl:w-auto">
                {/* On mobile, don't hide the label so it matches the height of the selects above it if they wrap */}
                <label className="text-sm font-medium invisible hidden xl:block">Clear</label>
                <button
                    onClick={handleClearFilters}
                    type="button"
                    className="h-[42px] px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-white dark:focus:ring-zinc-700 transition-colors"
                >
                    Clear filters
                </button>
            </div>
        </form>
    );
};

"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { QUERY_PARAMS } from "@/app/constants/queryParams";

export const SearchBar: React.FC = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const currentQuery = searchParams.get(QUERY_PARAMS.QUERY)?.toString() || "";
    const [inputValue, setInputValue] = useState(currentQuery);


    useEffect(() => {
        setInputValue(currentQuery);
    }, [currentQuery]);

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        params.set(QUERY_PARAMS.PAGE, "1"); // Reset to page 1 on new search

        if (term) {
            params.set(QUERY_PARAMS.QUERY, term);
        } else {
            params.delete(QUERY_PARAMS.QUERY);
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className="relative flex flex-1 flex-shrink-0">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
            </div>
            <input
                type="text"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-xl focus:ring-blue-500 focus:border-blue-500 block pl-12 p-4 dark:bg-zinc-950 dark:border-zinc-700 dark:placeholder-gray-500 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all shadow-sm"
                placeholder="Search high-quality editorial images... e.g., 'nature', 'Michael Jackson'"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    handleSearch(e.target.value);
                }}
            />
        </div>
    );
};

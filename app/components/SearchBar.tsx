"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useUrlParams } from "@/app/hooks/useUrlParams";
import { QUERY_PARAMS } from "@/app/constants/queryParams";

const MIN_SEARCH_LENGTH = 3;

export const SearchBar: React.FC = () => {
    const { getParam, updateParams } = useUrlParams();

    const currentQuery = getParam(QUERY_PARAMS.QUERY);
    const [inputValue, setInputValue] = useState(currentQuery);

    const isUserTypingRef = useRef(false);

    useEffect(() => {
        if (isUserTypingRef.current) {
            isUserTypingRef.current = false;
            return;
        }
        setInputValue(currentQuery);
    }, [currentQuery]);

    const triggerSearch = (term: string) => {
        const trimmed = term.trim();
        if (trimmed.length > 0 && trimmed.length < MIN_SEARCH_LENGTH) {
            return; // Too short, don't search yet
        }
        isUserTypingRef.current = true;
        updateParams({ [QUERY_PARAMS.QUERY]: trimmed || null });
    };

    const handleSearch = useDebouncedCallback(triggerSearch, 300);

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSearch.cancel(); // Cancel any pending debounce
        triggerSearch(inputValue); // Immediately trigger search on Enter
    };

    const showHint = inputValue.trim().length > 0 && inputValue.trim().length < MIN_SEARCH_LENGTH;

    return (
        <form
            className="relative flex flex-1 flex-shrink-0 flex-col"
            onSubmit={handleSubmit}
        >
            <div className="relative">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                    </svg>
                </div>
                <input
                    id="search-input"
                    type="text"
                    aria-label="Search media items"
                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-12 p-4 dark:bg-zinc-950 dark:border-zinc-700 dark:placeholder-gray-500 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all shadow-sm"
                    placeholder="Search high-quality editorial images... e.g., 'nature', 'Michael Jackson'"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        handleSearch(e.target.value);
                    }}
                />
            </div>
            {showHint && (
                <p className="text-sm text-gray-400 dark:text-zinc-500 mt-2 ml-1 transition-opacity">
                    Type at least {MIN_SEARCH_LENGTH} characters to search…
                </p>
            )}
        </form>
    );
};

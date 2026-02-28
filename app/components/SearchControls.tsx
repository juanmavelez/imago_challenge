import React from "react";
import { SearchBar } from "./SearchBar";
import { Filters } from "./Filters";

export const SearchControls: React.FC = () => {
    return (
        <section className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-6 flex flex-col gap-6 ring-1 ring-gray-200 dark:ring-zinc-800">
            <SearchBar />
            <Filters />
        </section>
    );
};

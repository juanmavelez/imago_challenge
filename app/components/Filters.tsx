"use client";

import React from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export const Filters: React.FC = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleFilterChange = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", "1"); // Reset to page 1 on filter change

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        replace(`${pathname}?${params.toString()}`);
    };

    const dateSort = searchParams.get("dateSort") || "latest";
    const selectedCredit = searchParams.get("credit") || "";

    return (
        <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort by Date:</label>
                <select
                    className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    value={dateSort}
                    onChange={(e) => handleFilterChange("dateSort", e.target.value)}
                >
                    <option value="latest">Latest first</option>
                    <option value="oldest">Oldest first</option>
                </select>
            </div>

            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Photographer:</label>
                <select
                    className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                    value={selectedCredit}
                    onChange={(e) => handleFilterChange("credit", e.target.value)}
                >
                    <option value="">All</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="Ansel Adams">Ansel Adams</option>
                    <option value="Imogen Cunningham">Imogen Cunningham</option>
                    <option value="Henri Cartier-Bresson">Henri Cartier-Bresson</option>
                </select>
            </div>
        </div>
    );
};

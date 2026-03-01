"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { QUERY_PARAMS } from "@/app/constants/queryParams";

interface PaginationProps {
    totalPages: number;
}

export const Pagination: React.FC<PaginationProps> = ({ totalPages }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentPage = Number(searchParams.get(QUERY_PARAMS.PAGE)) || 1;

    if (totalPages <= 1) return null;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set(QUERY_PARAMS.PAGE, pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    return (
        <div className="flex justify-center gap-4 mt-8">
            <Link
                href={createPageURL(currentPage - 1)}
                className={`px-5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 font-medium transition-colors ${currentPage <= 1
                    ? "opacity-50 pointer-events-none"
                    : "hover:bg-gray-50 dark:hover:bg-zinc-800"
                    }`}
                aria-disabled={currentPage <= 1}
            >
                Previous
            </Link>

            <span className="flex items-center text-sm font-medium px-4 text-gray-500">
                Page {currentPage} of {totalPages}
            </span>

            <Link
                href={createPageURL(currentPage + 1)}
                className={`px-5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 font-medium transition-colors ${currentPage >= totalPages
                    ? "opacity-50 pointer-events-none"
                    : "hover:bg-gray-50 dark:hover:bg-zinc-800"
                    }`}
                aria-disabled={currentPage >= totalPages}
            >
                Next
            </Link>
        </div>
    );
};

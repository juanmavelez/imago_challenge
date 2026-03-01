import React from "react";
import Link from "next/link";

export const Header: React.FC = () => {
    return (
        <header className="flex flex-col items-center text-center gap-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                IMAGO Search Engine
            </h1>
            <div className="flex flex-col gap-2 items-center">
                <p className="text-lg text-gray-500 max-w-xl">
                    A high-performance search experience using Next.js App Router RSC and a custom Inverted Index.
                </p>
                <Link
                    href="/analytics"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 underline underline-offset-4"
                >
                    View Search Analytics &rarr;
                </Link>
            </div>
        </header>
    );
};

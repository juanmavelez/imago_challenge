import React from "react";

export const Header: React.FC = () => {
    return (
        <header className="flex flex-col items-center text-center gap-4">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                IMAGO Search Engine
            </h1>
            <p className="text-lg text-gray-500 max-w-xl">
                A high-performance search experience using Next.js App Router RSC and a custom Inverted Index.
            </p>
        </header>
    );
};

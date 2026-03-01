"use client";

import React from "react";

interface FilterDateProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
}

export const FilterDate: React.FC<FilterDateProps> = ({ label, value, onChange }) => (
    <div className="flex flex-col gap-1 w-full sm:w-auto">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</label>
        <input
            type="date"
            className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-colors"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

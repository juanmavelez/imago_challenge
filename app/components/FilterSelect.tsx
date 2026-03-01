"use client";

import React from "react";

interface FilterSelectProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    className?: string;
}

export const FilterSelect: React.FC<FilterSelectProps> = ({ label, value, onChange, options, className }) => (
    <div className={`flex flex-col gap-1 w-full sm:w-auto ${className || ''}`}>
        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</label>
        <select
            className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-colors"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

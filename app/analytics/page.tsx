"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnalyticsStats } from "@/lib/analytics/AnalyticsStore";

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/analytics");
            if (!response.ok) {
                throw new Error("Failed to fetch analytics");
            }
            const data = await response.json();
            setStats(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-neutral-950 p-8 font-sans text-neutral-100">
            <div className="mx-auto max-w-5xl">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Search Analytics</h1>
                        <p className="text-neutral-400">Real-time metrics from the IMAGO Search Engine API.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={fetchStats}
                            className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-neutral-950"
                        >
                            Refresh Data
                        </button>
                        <Link
                            href="/"
                            className="rounded-md bg-white text-black px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950"
                        >
                            Back to Search
                        </Link>
                    </div>
                </header>

                {error && (
                    <div className="rounded-lg bg-red-900/50 p-4 border border-red-800 text-red-200 mb-8">
                        <p>Error loading analytics: {error}</p>
                    </div>
                )}

                {loading && !stats ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                ) : stats ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Summary Cards */}
                        <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-center shadow-lg relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <h2 className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2 relative z-10">Total Searches</h2>
                                <p className="text-5xl font-bold text-white tracking-tight relative z-10">{stats.totalSearches}</p>
                            </div>

                            <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-6 flex flex-col justify-center shadow-lg relative overflow-hidden group">
                                <div className="absolute inset-0 bg-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <h2 className="text-neutral-400 text-sm font-medium uppercase tracking-wider mb-2 relative z-10">Avg Response Time</h2>
                                <div className="flex items-baseline gap-2 relative z-10">
                                    <p className="text-5xl font-bold text-white tracking-tight">{stats.averageResponseTimeMs.toFixed(2)}</p>
                                    <span className="text-neutral-500 font-medium">ms</span>
                                </div>
                            </div>
                        </div>

                        {/* Popular Keywords Section */}
                        <div className="col-span-full rounded-xl bg-neutral-900 border border-neutral-800 p-6 shadow-lg">
                            <h2 className="text-lg font-semibold text-white mb-6 flex justify-between items-center border-b border-neutral-800 pb-4">
                                Top Viewed Keywords
                                <span className="text-xs font-normal text-neutral-500 bg-neutral-800 px-2 py-1 rounded-full">Top 10</span>
                            </h2>

                            {stats.popularKeywords.length === 0 ? (
                                <p className="text-neutral-500 text-center py-8">No keywords recorded yet. Try doing some searches!</p>
                            ) : (
                                <div className="space-y-4">
                                    {stats.popularKeywords.map((item, index) => {
                                        // Calculate percentage for a visual bar (relative to the most popular item)
                                        const maxCount = Math.max(...stats.popularKeywords.map(k => k.count));
                                        const percentage = Math.max(5, (item.count / maxCount) * 100);

                                        return (
                                            <div key={item.keyword} className="flex items-center gap-4 group">
                                                <div className="w-6 text-center text-neutral-500 text-sm font-mono border border-neutral-800 rounded-md py-0.5 bg-neutral-950/50">
                                                    #{index + 1}
                                                </div>
                                                <div className="w-32 lg:w-48 text-neutral-200 truncate font-medium text-sm">
                                                    "{item.keyword}"
                                                </div>
                                                <div className="flex-1 h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-neutral-600 to-white rounded-full transition-all duration-1000 ease-out group-hover:brightness-125"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <div className="w-12 text-right text-sm font-medium text-neutral-400 bg-neutral-800/50 rounded-md py-1 px-2 border border-neutral-800">
                                                    {item.count}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

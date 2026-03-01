import { NextResponse } from "next/server";
import { AnalyticsStore } from "@/lib/analytics/AnalyticsStore";

// The url is always the same, we need to avoid the cache
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const stats = AnalyticsStore.getStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error("Analytics API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

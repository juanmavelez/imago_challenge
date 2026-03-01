import { NextResponse } from "next/server";
import { AnalyticsStore } from "@/lib/analytics/AnalyticsStore";

export async function POST() {
    try {
        AnalyticsStore.flushData();
        return NextResponse.json({ message: "Analytics data flushed successfully" });
    } catch (error) {
        console.error("Flush Analytics API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

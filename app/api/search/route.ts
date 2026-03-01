import { NextRequest, NextResponse } from "next/server";
import { executeSearch } from "./SearchService";
import { QUERY_PARAMS } from "@/app/constants/queryParams";
import { AnalyticsStore } from "@/lib/analytics/AnalyticsStore";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse and validate query parameters
        const query = searchParams.get(QUERY_PARAMS.QUERY) || "";
        const page = Math.max(1, parseInt(searchParams.get(QUERY_PARAMS.PAGE) || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get(QUERY_PARAMS.LIMIT) || "20", 10)));
        const dateSort = searchParams.get(QUERY_PARAMS.DATE_SORT);
        const restrictions = searchParams.get(QUERY_PARAMS.RESTRICTIONS);
        const credit = searchParams.get(QUERY_PARAMS.CREDIT);
        const dateStart = searchParams.get(QUERY_PARAMS.DATE_START);
        const dateEnd = searchParams.get(QUERY_PARAMS.DATE_END);

        const startTime = performance.now();
        const result = executeSearch({
            query,
            page,
            limit,
            dateSort,
            restrictions,
            credit,
            dateStart,
            dateEnd
        });
        const endTime = performance.now();

        AnalyticsStore.trackSearch(query, endTime - startTime);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

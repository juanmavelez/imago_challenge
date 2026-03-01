import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "./SearchService";
import { QUERY_PARAMS } from "@/app/constants/queryParams";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse query parameters
        const query = searchParams.get(QUERY_PARAMS.QUERY) || "";
        const page = parseInt(searchParams.get(QUERY_PARAMS.PAGE) || "1", 10);
        const limit = parseInt(searchParams.get(QUERY_PARAMS.LIMIT) || "20", 10);
        const dateSort = searchParams.get(QUERY_PARAMS.DATE_SORT); // 'latest' | 'oldest'
        const restrictions = searchParams.get(QUERY_PARAMS.RESTRICTIONS); // comma separated
        const credit = searchParams.get(QUERY_PARAMS.CREDIT);
        const dateStart = searchParams.get(QUERY_PARAMS.DATE_START);
        const dateEnd = searchParams.get(QUERY_PARAMS.DATE_END);

        // Delegate business logic to the SearchService
        const result = SearchService.executeSearch({
            query,
            page,
            limit,
            dateSort,
            restrictions,
            credit,
            dateStart,
            dateEnd
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

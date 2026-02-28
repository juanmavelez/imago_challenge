import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "./SearchService";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const dateSort = searchParams.get("dateSort"); // 'latest' | 'oldest'
    const restrictions = searchParams.get("restrictions"); // comma separated
    const credit = searchParams.get("credit");

    // Delegate business logic to the SearchService
    const result = SearchService.executeSearch({
        query,
        page,
        limit,
        dateSort,
        restrictions,
        credit
    });

    return NextResponse.json(result);
}

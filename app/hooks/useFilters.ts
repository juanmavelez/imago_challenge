import { useUrlParams } from "./useUrlParams";
import { useCallback, useMemo } from "react";
import { QUERY_PARAMS } from "@/app/constants/queryParams";
import { SORT_OPTIONS } from "@/app/constants/sortOptions";

export const FILTER_KEYS = [
    QUERY_PARAMS.QUERY,
    QUERY_PARAMS.DATE_SORT,
    QUERY_PARAMS.CREDIT,
    QUERY_PARAMS.DATE_START,
    QUERY_PARAMS.DATE_END,
    QUERY_PARAMS.RESTRICTIONS
] as const;

export const useFilters = () => {
    const { getParam, updateParams } = useUrlParams();

    const filters = useMemo(() => {
        const defaultSort = SORT_OPTIONS.RELEVANCE;

        return {
            dateSort: getParam(QUERY_PARAMS.DATE_SORT, defaultSort),
            selectedCredit: getParam(QUERY_PARAMS.CREDIT),
            dateStart: getParam(QUERY_PARAMS.DATE_START),
            dateEnd: getParam(QUERY_PARAMS.DATE_END),
            restrictions: getParam(QUERY_PARAMS.RESTRICTIONS),
        };
    }, [getParam]);

    const hasFilters = useMemo(() => {
        const defaultSort = SORT_OPTIONS.RELEVANCE;

        return filters.dateSort !== defaultSort ||
            filters.selectedCredit !== "" ||
            filters.dateStart !== "" ||
            filters.dateEnd !== "" ||
            filters.restrictions !== "";
    }, [filters, getParam]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        updateParams({ [key]: value });
    }, [updateParams]);

    const handleClearFilters = useCallback(() => {
        const resetUpdates = FILTER_KEYS.reduce((acc, key) => {
            acc[key] = null;
            return acc;
        }, {} as Record<string, string | null>);

        updateParams(resetUpdates);
    }, [updateParams]);

    return {
        ...filters,
        hasFilters,
        handleFilterChange,
        handleClearFilters
    };
};

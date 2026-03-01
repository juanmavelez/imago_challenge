import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { QUERY_PARAMS } from "@/app/constants/queryParams";

export const useUrlParams = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const getParam = useCallback((key: string, defaultValue: string = "") => {
        return searchParams.get(key) || defaultValue;
    }, [searchParams]);

    const updateParams = useCallback((updates: Record<string, string | null>, resetPage: boolean = true) => {
        const params = new URLSearchParams(searchParams.toString());

        if (resetPage) {
            params.set(QUERY_PARAMS.PAGE, "1");
        }

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        replace(`${pathname}?${params.toString()}`);
    }, [searchParams, pathname, replace]);

    return { getParam, updateParams, searchParams };
};

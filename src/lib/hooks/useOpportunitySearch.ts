import { useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { postJSON } from '@/lib/fetcher';
import type { SearchResponse } from '@/components/console/opportunity/search/types';
import type { SortBy, SortDir } from '@/components/console/opportunity/OpportunitySearchFilters';

const SEARCH_ENDPOINT = '/api/opportunities/search';

export interface OpportunitySearchRequest {
    q?: string;
    projectType?: string[];
    projectStage?: string[];
    partnershipRoles?: string[];
    posted?: boolean;
    searchable?: boolean;
    sortBy: SortBy;
    sortDir: SortDir;
    page: number;
    pageSize: number;
    showDetails?: boolean;
    [key: string]: unknown;
}

export function useOpportunitySearch(body: OpportunitySearchRequest | null) {
    const key = body ? [SEARCH_ENDPOINT, body] as const : null;

    const swr = useSWR<SearchResponse>(
        key,
        ([url, payload]) => postJSON<SearchResponse>(url, { arg: payload }),
        { revalidateOnFocus: false }
    );

    const mutation = useSWRMutation<SearchResponse, unknown, typeof SEARCH_ENDPOINT, OpportunitySearchRequest>(
        SEARCH_ENDPOINT,
        (url, { arg }) => postJSON<SearchResponse>(url, { arg })
    );

    const refresh = useCallback(
        (payload?: OpportunitySearchRequest) => {
            const effective = payload ?? body;
            if (!effective) {
                return Promise.resolve(undefined);
            }
            return mutation.trigger(effective);
        },
        [body, mutation]
    );

    return {
        data: swr.data,
        error: swr.error,
        isLoading: swr.isLoading,
        mutate: swr.mutate,
        refresh,
        refreshing: mutation.isMutating,
    };
}

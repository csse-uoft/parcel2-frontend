import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { fetcher, postJSON } from '@/lib/fetcher';
import type { OpportunityDTO } from '../opportunities/types';
import type { OpportunityFormData } from '@/components/forms/schema/Opportunity';
import { pruneEmpty } from '../utils';
import { formToUpsertBody } from '../opportunities/mapper';
import { FetcherError } from '@/lib/errors';

// Org options for partners (mapped to {id,label})
export function useOrgOptions() {
    const { data, error, isLoading, mutate } = useSWR<any[]>('/api/organizations', fetcher, {
        revalidateOnFocus: false,
    });

    const options = (Array.isArray(data) ? data : []).map((o: any) => ({
        id: o.iri ?? o.id ?? o['@id'] ?? '',
        label: o.name ?? o.label ?? o.title ?? (o.iri ?? ''),
    }));

    return { options, isLoading, error, mutate };
}

// Single opportunity
export function useOpportunity(iri?: string | null) {
    const key = iri ? `/api/opportunities/${encodeURIComponent(iri)}` : null;
    return useSWR<OpportunityDTO, FetcherError>(key, fetcher, { revalidateOnFocus: false });
}

// Create
export function useCreateOpportunity() {
    return useSWRMutation<OpportunityDTO, FetcherError, string, OpportunityFormData>(
        '/api/opportunities',
        (url, { arg }) => postJSON<OpportunityDTO>(url, { arg: pruneEmpty(formToUpsertBody(arg)) })
    );
}

// Update
export function useUpdateOpportunity(iri?: string | null) {
    let hook;
    if (!iri) {
        // Return a no-op mutation if no IRI is provided
        hook = {
            trigger: async () => {
                throw new Error('No IRI provided for updating opportunity');
            },
            isMutating: false,
            error: undefined,
        };
    }
    const key = `/api/opportunities/${encodeURIComponent(iri!)}`;
    hook = useSWRMutation<OpportunityDTO, FetcherError, string, OpportunityFormData>(
        key,
        (url, { arg }) => postJSON<OpportunityDTO>(url, { arg: pruneEmpty(formToUpsertBody(arg)) })
    );

    return hook;
}

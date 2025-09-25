import useSWR, { SWRConfiguration } from 'swr';
import { fetcher } from '@/lib/fetcher';

export type TaxonomyItem = {
    id: string;
    label: string;
    description?: string;
};

function normalizeTaxonomy(json: any): TaxonomyItem[] {
    const list = Array.isArray(json) ? json : Array.isArray(json?.items) ? json.items : [];
    return list.map((item: any): TaxonomyItem => ({
        id: item.id ?? item.iri ?? item.value ?? item['@id'] ?? String(item),
        label:
            item.label ??
            item.name ??
            item.title ??
            String(item.id ?? item.iri ?? item.value ?? item['@id'] ?? item),
        description: item.description ?? item.note ?? item['rdfs:comment'],
    }));
}

/** Internal fetcher wrapper that uses your global fetcher and tolerates 404 as empty. */
async function fetchTaxonomyWithFetcher(iri: string): Promise<TaxonomyItem[]> {
    try {
        const json = await fetcher<any>(`/taxonomy/${encodeURIComponent(iri)}`);
        return normalizeTaxonomy(json);
    } catch (e: any) {
        if (e?.status === 404 || e?.status === 204) return [];
        throw e;
    }
}

/**
 * Load a taxonomy by IRI.
 * Usage: const { items, isLoading } = useTaxonomy('bedeo:RoleType');
 */
export function useTaxonomy(
    iri: string,
    config?: SWRConfiguration
) {
    const key = iri ? ['/taxonomy', iri] as const : null;

    const swr = useSWR<TaxonomyItem[]>(
        key,
        // SWR feed only the IRI to our wrapper; your global fetcher builds the full URL.
        ([, iriParam]) => fetchTaxonomyWithFetcher(iri),
        {
            revalidateOnFocus: false,
            dedupingInterval: 30_000,
            ...config,
        }
    );

    return {
        items: swr.data ?? [],
        isLoading: swr.isLoading,
        isError: Boolean(swr.error),
        error: swr.error as Error | undefined,
        mutate: swr.mutate,
    };
}

/** Convenience: RoleType taxonomy for partnershipRoles and partner roles. */
export function useRoleTypeOptions(config?: SWRConfiguration) {
    const { items, ...rest } = useTaxonomy('bedeo:RoleType', config);
    // items already in { id, label, description? } shape
    return { options: items, ...rest };
}

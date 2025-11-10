import { useMemo } from 'react';
import useSWR from 'swr';

import { fetcher } from '@/lib/fetcher';

export interface OrganizationOpportunityOption {
    iri: string;
    name?: string;
}

export interface OrganizationCatalogEntry {
    iri: string;
    name?: string;
    opportunities: OrganizationOpportunityOption[];
}

function toOpportunityOption(raw: unknown): OrganizationOpportunityOption | null {
    if (!raw) return null;
    if (typeof raw === 'string') {
        return { iri: raw };
    }
    if (typeof raw === 'object') {
        const iri = (raw as any).iri ?? (raw as any)['@id'];
        if (!iri) return null;
        return {
            iri,
            name:
                (raw as any).name ??
                (raw as any).title ??
                (raw as any).label ??
                (raw as any).description ??
                undefined,
        };
    }
    return null;
}

function toCatalogEntry(raw: unknown): OrganizationCatalogEntry | null {
    if (!raw || typeof raw !== 'object') return null;
    const iri = (raw as any).iri ?? (raw as any)['@id'];
    if (!iri) return null;

    const name =
        (raw as any).name ??
        (raw as any).tradeName ??
        (raw as any).briefDescription ??
        (raw as any).description ??
        undefined;

    const rawOpps = (raw as any).opportunities;
    const opportunities: OrganizationOpportunityOption[] = Array.isArray(rawOpps)
        ? rawOpps
            .map(toOpportunityOption)
            .filter((item): item is OrganizationOpportunityOption => Boolean(item))
        : [];

    return { iri, name, opportunities };
}

export function useOrganizationsCatalog(limit = 500) {
    const query = `/api/organizations?limit=${encodeURIComponent(String(limit))}`;

    const { data, error, isLoading, mutate } = useSWR<unknown[]>(
        query,
        fetcher,
        { revalidateOnFocus: false },
    );

    const organizations = useMemo<OrganizationCatalogEntry[]>(() => {
        if (!Array.isArray(data)) return [];
        return data
            .map(toCatalogEntry)
            .filter((entry): entry is OrganizationCatalogEntry => Boolean(entry));
    }, [data]);

    return {
        organizations,
        error,
        isLoading,
        mutate,
    };
}

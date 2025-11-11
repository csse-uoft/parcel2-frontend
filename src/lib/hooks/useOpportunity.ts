import useSWR from 'swr';

import { fetcher } from '@/lib/fetcher';
import { FetcherError } from '@/lib/errors';

export type RoleDTO = { iri: string; name?: string; description?: string };
export type TaxonomyDTO = { iri: string; name?: string; description?: string };
export type ContactDTO = {
    iri: string;
    contactName?: string;
    email?: string;
    phone?: string;
    [key: string]: unknown;
};

export interface OpportunityDTO {
    iri: string;
    name?: string;
    isOwner?: boolean;
    description?: string;
    partnershipRoles?: RoleDTO[];
    primaryContact?: ContactDTO;
    projectType?: TaxonomyDTO;
    projectStage?: TaxonomyDTO;
    land?: unknown;
    lands?: unknown[];
    organization?: {
        iri: string;
        name?: string;
    };
    organizationIri?: string;
    additionalInfo?: {
        iri?: string;
        isPosted?: boolean | string;
        isSearchable?: boolean | string;
        datePosted?: string | Date;
        dateModified?: string | Date;
        images?: string[];
        files?: string[];
        primaryImage?: string;
    };
    [key: string]: unknown;
}

const DEFAULT_OPTIONS = {
    revalidateOnFocus: false,
} as const;

type UseOpportunityOptions = {
    revalidateOnFocus?: boolean;
};

export function useOpportunity(iri?: string | null, options: UseOpportunityOptions = {}) {
    const key = iri ? `/api/opportunities/${encodeURIComponent(iri)}` : null;

    const swr = useSWR<OpportunityDTO, FetcherError>(key, fetcher, {
        ...DEFAULT_OPTIONS,
        ...options,
    });

    return {
        ...swr,
        opportunity: swr.data,
    };
}

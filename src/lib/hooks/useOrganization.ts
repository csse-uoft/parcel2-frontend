import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import { FetcherError } from '@/lib/errors';
import { postJSON } from '@/lib/fetcher';
import { useNullableFetcher } from './useNullableFetcher';
import type { AdminOrganization } from '@/components/console/types';

const ORGANIZATION_ENDPOINT = '/api/profile/org';

type OrganizationUpsertPayload = {
    organization: Record<string, unknown>;
};

export function useOrganization() {
    const fetchOrganization = useNullableFetcher<AdminOrganization>();

    return useSWR<AdminOrganization | null>(
        ORGANIZATION_ENDPOINT,
        fetchOrganization
    );
}

export function useUpsertOrganization() {
    return useSWRMutation<void, FetcherError, typeof ORGANIZATION_ENDPOINT, OrganizationUpsertPayload>(
        ORGANIZATION_ENDPOINT,
        postJSON,
    );
}

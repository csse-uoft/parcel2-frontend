import useSWR from 'swr';

import { fetcher } from '@/lib/fetcher';
import { useNullableFetcher } from './useNullableFetcher';
import type { AdminOrganization } from '@/components/console/types';

const ADMIN_ORGANIZATIONS_ENDPOINT = '/api/admin/organizations';
const ORG_ADMIN_ORGANIZATION_ENDPOINT = '/api/org-admin/organization';

export function useAdminOrganizations(enabled: boolean) {
    const key = enabled ? ADMIN_ORGANIZATIONS_ENDPOINT : null;
    return useSWR<AdminOrganization[]>(
        key,
        endpoint => fetcher<AdminOrganization[]>(endpoint),
        { keepPreviousData: true },
    );
}

export function useManagedOrganization(enabled: boolean) {
    const fetchManaged = useNullableFetcher<AdminOrganization>();
    const key = enabled ? ORG_ADMIN_ORGANIZATION_ENDPOINT : null;
    return useSWR<AdminOrganization | null>(
        key,
        fetchManaged,
        { keepPreviousData: true },
    );
}

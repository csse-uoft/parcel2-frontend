import useSWR from 'swr';

import { fetcher } from '@/lib/fetcher';
import type { ConsoleUser } from '@/components/console/types';

const ADMIN_USERS_ENDPOINT = '/api/admin/users';
const ORG_ADMIN_USERS_ENDPOINT = '/api/org-admin/users';

type UserScope = 'admin' | 'org_admin' | null;

export function useConsoleUsers(endpoint: string | null) {
    return useSWR<ConsoleUser[]>(
        endpoint,
        key => fetcher<ConsoleUser[]>(key),
        { keepPreviousData: true },
    );
}

export function useScopedConsoleUsers(scope: UserScope) {
    const endpoint = scope === 'admin'
        ? ADMIN_USERS_ENDPOINT
        : scope === 'org_admin'
            ? ORG_ADMIN_USERS_ENDPOINT
            : null;

    return useConsoleUsers(endpoint);
}

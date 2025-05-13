import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export interface CurrentUser {
    _id: string;
    username: string;
    email: string;
    lastLogin?: string;
    exp: number;
}

export function useUser() {
    const { data, error, mutate, isLoading } = useSWR<CurrentUser>(
        '/api/auth/me',
        fetcher,
        {
            refreshInterval: 60_000,           // 60 s polling keeps it fresh
            revalidateOnFocus: true,
        },
    );

    return {
        user: data,
        isLoading,
        isError: !!error,
        // lets other hooks / components refresh after login / logout
        mutate,
    };
}

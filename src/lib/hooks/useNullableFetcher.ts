import { useCallback } from 'react';
import { fetcher } from '@/lib/fetcher';
import { FetcherError } from '@/lib/errors';

/**
 * Returns a memoised fetcher that resolves to `null` when the server responds with 404.
 * Useful for endpoints where the resource may not exist yet (e.g., optional profiles).
 */
export function useNullableFetcher<T>() {
    return useCallback(async (url: string): Promise<T | null> => {
        try {
            return await fetcher<T>(url);
        } catch (err) {
            if (err instanceof FetcherError && err.status === 404) {
                return null;
            }
            throw err;
        }
    }, []);
}

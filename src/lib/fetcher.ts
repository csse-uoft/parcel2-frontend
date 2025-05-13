import { logoutSilently } from '@/contexts/UserContext';
import { FetcherError } from "@/lib/errors";

export async function fetcher<T>(input: RequestInfo, params?: RequestInit): Promise<T> {
    console.log(`fetching ${input} with params:`, params);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}${input}`, {
        credentials: 'include',      // send/receive the http‑only cookie
        headers: { 'Content-Type': 'application/json' },
        ...params,
    });

    if (res.status === 401 || res.status === 419) {
        // Handle unauthorized access (e.g., token expired)
        const error = new FetcherError('Session expired or unauthorized');
        error.status = res.status;
        logoutSilently();

        throw error;
    }

    if (!res.ok) {
        // Try to parse error payload; fall back to status text
        const err = await res.json().catch(() => ({}));
        const error = new FetcherError(err.message ?? res.statusText);
        error.status = res.status;
        error.data = err;

        throw error;
    }
    return res.json();
}

export async function postJSON<T>(url: string, { arg }: { arg: unknown }) {
    return fetcher<T>(url, { method: 'POST', body: arg ? JSON.stringify(arg) : undefined});
}

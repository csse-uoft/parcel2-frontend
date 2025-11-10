import { logoutSilently } from '@/contexts/UserContext';
import { FetcherError } from '@/lib/errors';

function isFormData(body: RequestInit['body']): body is FormData {
    return typeof FormData !== 'undefined' && body instanceof FormData;
}

export async function fetcher<T>(input: RequestInfo, params?: RequestInit): Promise<T> {
    const init: RequestInit = {
        credentials: 'include',
        ...params,
    };

    const headers = new Headers(init.headers ?? {});
    if (!isFormData(init.body) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    init.headers = headers;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}${input}`, init);
    const rawBody = await response.text();

    const parseJson = () => {
        if (!rawBody) return undefined;
        try {
            return JSON.parse(rawBody);
        } catch {
            return undefined;
        }
    };

    if (response.status === 401 || response.status === 419) {
        const payload = parseJson();
        const message =
            (payload && typeof payload === 'object' && 'message' in payload)
                ? String((payload as any).message)
                : 'Session expired or unauthorized';

        const error = new FetcherError(message);
        error.status = response.status;
        error.data = payload;
        logoutSilently();
        throw error;
    }

    if (!response.ok) {
        const payload = parseJson();
        const message =
            (payload && typeof payload === 'object' && 'message' in payload)
                ? String((payload as any).message)
                : (rawBody || response.statusText);

        const error = new FetcherError(message);
        error.status = response.status;
        error.data = payload ?? rawBody;
        throw error;
    }

    if (!rawBody) {
        return undefined as T;
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
        return JSON.parse(rawBody) as T;
    }

    return rawBody as unknown as T;
}

export async function postJSON<T>(url: string, { arg }: { arg: unknown }) {
    return fetcher<T>(url, { method: 'POST', body: arg ? JSON.stringify(arg) : undefined });
}

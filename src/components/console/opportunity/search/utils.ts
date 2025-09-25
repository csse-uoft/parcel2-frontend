const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

export const absUrl = (u?: string) =>
    !u ? undefined : /^https?:\/\//i.test(u) ? u : `${API_BASE}${u}`;

export function useDebounced<T>(value: T, delay = 350) {
    const [v, setV] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

export function toLabel(
    v: string | { iri: string; name?: string } | undefined,
    options: { id: string; label: string }[]
) {
    if (!v) return undefined;
    if (typeof v !== 'string') return v.name ?? v.iri;
    return options.find((o) => o.id === v)?.label ?? v;
}

export function roleLabels(
    arr: Array<string | { iri: string; name?: string }> | undefined,
    options: { id: string; label: string }[]
) {
    return (arr ?? []).map((v) =>
        typeof v === 'string' ? options.find((o) => o.id === v)?.label ?? v : v.name ?? v.iri
    );
}

/* React imports kept here to avoid repeating in callers */
import { useEffect, useState } from 'react';

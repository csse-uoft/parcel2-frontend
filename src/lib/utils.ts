export function pruneEmpty<T>(obj: T): T {
    // Remove undefined, null, empty strings/arrays/objects
    const isPlain = (v: any) => Object.prototype.toString.call(v) === '[object Object]';
    const clean = (v: any): any => {
        if (Array.isArray(v)) return v.map(clean).filter(x => x !== undefined);
        if (isPlain(v)) {
            const out: any = {};
            for (const [k, val] of Object.entries(v)) {
                const cv = clean(val);
                const keep =
                    cv !== undefined &&
                    !(typeof cv === 'string' && cv.trim() === '') &&
                    !(Array.isArray(cv) && cv.length === 0) &&
                    !(isPlain(cv) && Object.keys(cv).length === 0);
                if (keep) out[k] = cv;
            }
            return Object.keys(out).length ? out : undefined;
        }
        if (v === null) return undefined;
        if (typeof v === 'string' && v.trim() === '') return undefined;
        return v;
    };
    return (clean(obj) ?? {}) as T;
}

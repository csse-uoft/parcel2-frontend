'use client';

import { createContext, useContext, useMemo, ReactNode, useCallback } from 'react';
import useSWR from 'swr';

import { fetcher, postJSON } from '@/lib/fetcher';

type OpportunityFavouriteInput = {
    iri: string;
    name?: string;
    organizationName?: string;
    projectTypeName?: string;
    stageName?: string;
};

export type OpportunityFavourite = {
    iri: string;
    name?: string;
    organizationName?: string;
    projectTypeName?: string;
    stageName?: string;
    addedAt: string;
};

type OpportunityFavouritesResponse = {
    favourites: OpportunityFavourite[];
};

type OpportunityFavouritesContextValue = {
    favourites: OpportunityFavourite[];
    isFavourite: (iri: string) => boolean;
    isLoading: boolean;
    error: unknown;
    addFavourite: (fav: OpportunityFavouriteInput) => Promise<void>;
    removeFavourite: (iri: string) => Promise<void>;
    toggleFavourite: (fav: OpportunityFavouriteInput) => Promise<void>;
    refresh: () => Promise<void>;
};

const OpportunityFavouritesContext = createContext<OpportunityFavouritesContextValue | undefined>(undefined);

type ProviderProps = {
    children: ReactNode;
};

const ENDPOINT = '/api/user/favourites';

export function OpportunityFavouritesProvider({ children }: ProviderProps) {
    const { data, error, isLoading, mutate } = useSWR<OpportunityFavouritesResponse>(
        ENDPOINT,
        url => fetcher<OpportunityFavouritesResponse>(url),
        { revalidateOnFocus: false },
    );

    const favourites = useMemo(() => data?.favourites ?? [], [data?.favourites]);

    const isFavourite = useCallback(
        (iri: string) => favourites.some(item => item.iri === iri),
        [favourites],
    );

    const refresh = useCallback(async () => {
        await mutate();
    }, [mutate]);

    const addFavourite = useCallback(async (fav: OpportunityFavouriteInput) => {
        if (!fav.iri) return;
        const payload = {
            opportunityIri: fav.iri,
        };
        const result = await postJSON<OpportunityFavouritesResponse>(ENDPOINT, { arg: payload });
        await mutate(result, { revalidate: false });
    }, [mutate]);

    const removeFavourite = useCallback(async (iri: string) => {
        if (!iri) return;
        const result = await fetcher<OpportunityFavouritesResponse>(
            `${ENDPOINT}/${encodeURIComponent(iri)}`,
            { method: 'DELETE' },
        );
        await mutate(result, { revalidate: false });
    }, [mutate]);

    const toggleFavourite = useCallback(async (fav: OpportunityFavouriteInput) => {
        if (!fav.iri) return;
        if (isFavourite(fav.iri)) {
            await removeFavourite(fav.iri);
        } else {
            await addFavourite(fav);
        }
    }, [addFavourite, isFavourite, removeFavourite]);

    const value = useMemo<OpportunityFavouritesContextValue>(() => ({
        favourites,
        isFavourite,
        isLoading,
        error,
        addFavourite,
        removeFavourite,
        toggleFavourite,
        refresh,
    }), [addFavourite, error, favourites, isFavourite, isLoading, refresh, removeFavourite, toggleFavourite]);

    return (
        <OpportunityFavouritesContext.Provider value={value}>
            {children}
        </OpportunityFavouritesContext.Provider>
    );
}

export function useOpportunityFavourites() {
    const ctx = useContext(OpportunityFavouritesContext);
    if (!ctx) {
        throw new Error('useOpportunityFavourites must be used within an OpportunityFavouritesProvider');
    }
    return ctx;
}

export type { OpportunityFavouriteInput };

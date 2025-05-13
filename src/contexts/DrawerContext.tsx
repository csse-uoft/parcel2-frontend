'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';

export interface DrawerCtx {
    open: boolean;
    toggle: () => void;          // convenience
    setOpen: (v: boolean) => void;
    permanent: boolean;          // true ≥ lg breakpoint
}

const DrawerContext = createContext<DrawerCtx>({
    open: true,
    toggle: () => {},
    setOpen: () => {},
    permanent: false,
});
export const useDrawer = () => useContext(DrawerContext);

export const DrawerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const permanent = useMediaQuery('(min-width:1200px)');      // lg
    const [open, setOpen] = useState(permanent);

    /* remember preference */
    useEffect(() => {
        const saved = localStorage.getItem('drawerOpen');
        if (saved !== null) setOpen(saved === 'true');
    }, []);
    useEffect(() => localStorage.setItem('drawerOpen', String(open)), [open]);

    /* force-open on desktop */
    useEffect(() => {
        if (permanent) setOpen(true);
    }, [permanent]);

    return (
        <DrawerContext.Provider
            value={{
                open,
                permanent,
                setOpen,
                toggle: () => setOpen(o => !o),
            }}
        >
            {children}
        </DrawerContext.Provider>
    );
};

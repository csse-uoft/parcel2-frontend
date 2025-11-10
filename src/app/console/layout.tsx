import { ReactNode } from 'react';
import ConsoleShell from '@/components/console/ConsoleShell';
import { DrawerProvider } from '@/contexts/DrawerContext';
import { RequireAuth } from '@/components/RequireAuth';
import { OpportunityFavouritesProvider } from '@/contexts/OpportunityFavouritesContext';

export default function SecureLayout({ children }: { children: ReactNode }) {
    return (
        <RequireAuth>
            <DrawerProvider>
                <OpportunityFavouritesProvider>
                    <ConsoleShell>{children}</ConsoleShell>
                </OpportunityFavouritesProvider>
            </DrawerProvider>
        </RequireAuth>
    );
}

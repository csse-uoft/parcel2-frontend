import { ReactNode } from 'react';
import ConsoleShell from '@/components/console/ConsoleShell';
import { DrawerProvider } from '@/contexts/DrawerContext';
import { RequireAuth } from '@/components/RequireAuth';

export default function SecureLayout({ children }: { children: ReactNode }) {
    return (
        <RequireAuth>
            <DrawerProvider>
                <ConsoleShell>{children}</ConsoleShell>
            </DrawerProvider>
        </RequireAuth>
    );
}

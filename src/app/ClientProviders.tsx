'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import Box from '@mui/material/Box';
import theme from '@/theme';
import { SnackbarProvider } from 'notistack';
import { UserProvider } from '@/contexts/UserContext';
import { usePathname } from '@/i18n/navigation';
import Footer from '@/components/Copyright';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith('/console');

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
          <UserProvider>
            <CssBaseline />
            <GlobalStyles styles={{ html: { scrollBehavior: 'smooth' } }} />
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
              </Box>
              {!hideFooter && <Footer />}
            </Box>
          </UserProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

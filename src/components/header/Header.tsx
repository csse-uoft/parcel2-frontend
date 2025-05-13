'use client';

import React from 'react';
import {
    AppBar,
    Toolbar,
    Button,
    Typography,
    Paper,
    Tabs,
    Tab,
    Box,
} from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import { useUserContext } from '@/contexts/UserContext';
import ModeSwitch from "@/components/ThemeModeSwitch";

const navTabs = [
    { label: 'Home', href: '/' },
    { label: 'Resources', href: '/resources' },
    { label: 'Case Studies', href: '/casestudies' },
    { label: 'Sectors', href: '/sectors' },
    { label: 'Toolkits', href: '/toolkits' },
];

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();                     // current route
    const user = useUserContext();                      // typed context

    /* Match tab by route – returns index | false */
    console.log(pathname)
    const activeTab = React.useMemo(() => {
        const idx = navTabs.findLastIndex(t => pathname?.startsWith(t.href));
        console.log('activeTab', idx);
        return idx === -1 ? false : idx;
    }, [pathname]);


    const handleLogOut = async () => {
        await user.logout();
    };

    return (
        <header>
            <AppBar sx={{ p: 1.5, bgcolor: 'rgb(0, 23, 81)' }} position="static">
                <Toolbar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h4">Parcel</Typography>
                        <Typography variant="subtitle1">
                            A Matching platform for building partners
                        </Typography>
                    </Box>

                    <ModeSwitch/>

                    {user.username === 'guest' ? (
                        <Button sx={{ color: 'white' }} onClick={() => router.push('/login')}>
                            Login
                        </Button>
                    ) : (
                        <>
                            <Button
                                sx={{ color: 'white' }}
                                onClick={() => router.push('/console/opportunity/search')}
                            >
                                Dashboard
                            </Button>
                            <Button sx={{ color: 'white' }} onClick={handleLogOut}>
                                Log out
                            </Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            <Paper square>
                <Tabs
                    variant="scrollable"
                    value={activeTab}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    {navTabs.map((tab, i) => (
                        <Tab
                            key={tab.href}
                            label={tab.label}
                            onClick={() => router.push(tab.href)}
                            value={i}
                        />
                    ))}
                </Tabs>
            </Paper>
        </header>
    );
}

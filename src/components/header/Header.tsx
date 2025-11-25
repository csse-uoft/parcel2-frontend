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
    Stack,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { useUserContext } from '@/contexts/UserContext';
import ModeSwitch from "@/components/ThemeModeSwitch";
import LanguageToggle from '@/components/header/LanguageToggle';
import { useRouter, usePathname } from '@/i18n/navigation';
import Image from 'next/image';

const navTabs = [
    { labelKey: 'Header.nav.home', href: '/' },
    { labelKey: 'Header.nav.mission', href: '/#mission' },
    { labelKey: 'Header.nav.about', href: '/#about' },
    // { labelKey: 'Header.nav.resources', href: '/resources' },
    // { labelKey: 'Header.nav.caseStudies', href: '/casestudies' },
    // { labelKey: 'Header.nav.sectors', href: '/sectors' },
    // { labelKey: 'Header.nav.toolkits', href: '/toolkits' },
];

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const user = useUserContext();
    const t = useTranslations();

    const activeTab = React.useMemo(() => {
        const idx = navTabs.findLastIndex(tab => pathname?.startsWith(tab.href));
        return idx === -1 ? false : idx;
    }, [pathname]);


    const handleLogOut = async () => {
        await user.logout();
    };

    const handleNav = (href: string) => {
        if (href.startsWith('/#') && pathname === '/') {
            const id = href.substring(2);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState({}, '', href);
                return;
            }
        }
        router.push(href);
    };

    return (
        <header>
            <AppBar sx={{ p: 1.5, bgcolor: 'rgb(0, 23, 81)' }} position="static">
                <Toolbar>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ flexGrow: 1 }}>
                        <Box sx={{ position: 'relative', width: { xs: 180, sm: 200 }, height: 70, minWidth: 140 }}>
                            <Image
                                src="/uoft-logo-white.svg"
                                alt={t('Header.logoAlt')}
                                fill
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                        </Box>
                        <Box>
                            <Typography variant="h4">{t('Header.brand')}</Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{ display: { xs: 'none', md: 'block' } }}
                            >
                                {t('Header.tagline')}
                            </Typography>
                        </Box>
                    </Stack>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LanguageToggle />
                        <ModeSwitch/>
                    </Box>

                    {user.isLoading ? null : user.username === 'guest' ? (
                        <Button sx={{ color: 'white' }} onClick={() => router.push('/login')}>
                            {t('Header.actions.login')}
                        </Button>
                    ) : (
                        <>
                            <Button
                                sx={{ color: 'white' }}
                                onClick={() => router.push('/console/opportunity/search')}
                            >
                                {t('Header.actions.dashboard')}
                            </Button>
                            <Button sx={{ color: 'white' }} onClick={handleLogOut}>
                                {t('Header.actions.logout')}
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
                            label={t(tab.labelKey)}
                            onClick={() => handleNav(tab.href)}
                            value={i}
                        />
                    ))}
                </Tabs>
            </Paper>
        </header>
    );
}

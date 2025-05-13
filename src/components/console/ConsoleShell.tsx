'use client';

import React, { useCallback, useMemo, useState } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Divider,
    Collapse,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Button,
    CssBaseline,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
    MenuOpen as MenuOpenIcon,
    ExpandLess,
    ExpandMore,
} from '@mui/icons-material';
import { styled, useColorScheme, useTheme } from '@mui/material/styles';
import { useRouter, usePathname } from 'next/navigation';

import { navConfig } from './navConfig';
import { useDrawer } from '@/contexts/DrawerContext';
import { useUserContext } from '@/contexts/UserContext';
import { Loading } from '@/components/Loading';
import ThemeModeSwitch from "@/components/ThemeModeSwitch";

const DRAWER_WIDTH = 240;
const DrawerHeader = styled('div')(({ theme }) => ({
    ...theme.mixins.toolbar,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: theme.spacing(1),
}));

const ConsoleShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    const isUpLg = useMediaQuery(theme.breakpoints.up('lg'));
    const { mode } = useColorScheme();

    const { open, toggle, setOpen, permanent } = useDrawer();
    const { logout } = useUserContext();

    /* ---------- expanded parent menus ------------------------------- */
    const [expanded, setExpanded] = useState<string[]>(
        navConfig
            .filter(i => i.children.some(c => c.href === pathname))
            .map(i => i.label),
    );
    const toggleParent = useCallback(
        (id: string) =>
            setExpanded(prev =>
                prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
            ),
        [],
    );

    /* ---------- menu list (memo) ------------------------------------ */
    const drawerMenus = useMemo(() => {
        const items: React.ReactElement[] = [];

        navConfig.forEach(({ type = 'menu', label, icon: Icon, children }) => {
            const parentOpen = expanded.includes(label);

            if (type === 'title') {
                items.push(
                    <ListItemButton
                        key={label}
                        onClick={() => toggleParent(label)}
                        sx={{
                            height: 42,
                            fontSize: 15,
                            fontWeight: 500,
                            ...(mode === 'light' ? {
                                bgcolor: 'rgb(234,234,234)',
                                '&:hover': { bgcolor: 'rgb(234,234,234)' },
                            } : {}),
                        }}
                    >
                        {Icon && (
                            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                <Icon />
                            </ListItemIcon>
                        )}
                        <ListItemText primary={label} />
                        {parentOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>,
                );
            }

            if (children) {
                items.push(
                    <Collapse
                        in={parentOpen}
                        timeout="auto"
                        unmountOnExit
                        key={`${label}-collapse`}
                    >
                        <List disablePadding>
                            {children.map(({ icon: ChildIcon, label: cLabel, href }) => (
                                <ListItemButton
                                    key={cLabel}
                                    selected={href === pathname}
                                    sx={{
                                        pl: 3,
                                        height: 42,
                                        fontSize: 15,
                                        ...(mode === 'light' ? {
                                            color: '#496169',
                                            '&.Mui-selected': {
                                                bgcolor: 'rgb(220,226,241)',
                                                color: '#5850ec',
                                                fontWeight: 600,
                                            },
                                        } : {}),

                                    }}
                                    onClick={() => {
                                        if (!isUpLg) setOpen(false);
                                        router.push(href);
                                    }}
                                >
                                    {ChildIcon && (
                                        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                            <ChildIcon />
                                        </ListItemIcon>
                                    )}
                                    <ListItemText primary={cLabel} />
                                </ListItemButton>
                            ))}
                        </List>
                        <Divider />
                    </Collapse>,
                );
            }
        });

        return <List>{items}</List>;
    }, [expanded, isUpLg, pathname, router, setOpen, toggleParent]);

    /* ---------- render --------------------------------------------- */
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />

            {/* AppBar */}
            <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={toggle} sx={{ mr: 2 }}>
                        {open ? <MenuOpenIcon /> : <MenuIcon />}
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }} />
                    <ThemeModeSwitch />
                    <Button color="inherit" onClick={() => router.push('/')}>
                        Home Page
                    </Button>
                    {/* use logout from UserContext */}
                    <Button color="inherit" onClick={logout}>
                        Log out
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Drawer
                variant={permanent ? 'permanent' : 'temporary'}
                open={open}
                onClose={() => setOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: open ? DRAWER_WIDTH : theme.spacing(7) + 1,
                        overflowX: 'hidden',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: open
                                ? theme.transitions.duration.enteringScreen
                                : theme.transitions.duration.leavingScreen,
                        }),
                    },
                }}
            >
                <DrawerHeader>
                    <Typography variant="h5" color="textSecondary" sx={{ fontWeight: 500 }}>
                        Parcel
                    </Typography>
                </DrawerHeader>
                {drawerMenus}
            </Drawer>

            {/* Main */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 1, md: 3 },
                    mt: 8,
                }}
            >
                <React.Suspense fallback={<Loading />}>{children}</React.Suspense>
            </Box>
        </Box>
    );
};

export default ConsoleShell;

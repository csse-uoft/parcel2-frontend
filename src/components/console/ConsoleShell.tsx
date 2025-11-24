'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Collapse,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Button,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
    MenuOpen as MenuOpenIcon,
    ExpandLess,
    ExpandMore,
} from '@mui/icons-material';
import { useColorScheme, useTheme, alpha } from '@mui/material/styles';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import { navConfig, NavSection } from './navConfig';
import { useDrawer } from '@/contexts/DrawerContext';
import { useUserContext } from '@/contexts/UserContext';
import { Loading } from '@/components/Loading';
import ThemeModeSwitch from "@/components/ThemeModeSwitch";
import LanguageToggle from '@/components/header/LanguageToggle';

const DRAWER_WIDTH = 240;

const ITEM_H = 44;
const ICON_W = 22;


const ConsoleShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    const t = useTranslations();
    const isUpLg = useMediaQuery(theme.breakpoints.up('lg'));
    const { mode, systemMode } = useColorScheme();
    const isDark = mode === 'dark' || (mode === 'system' && systemMode === 'dark');

    const { open, toggle, setOpen, permanent } = useDrawer();
    const { logout, roles } = useUserContext();

    const hasRequiredRole = useCallback(
        (required?: string[]) => {
            if (!required || required.length === 0) return true;
            return required.some(role => roles.includes(role));
        },
        [roles],
    );

    const visibleSections = useMemo(() => {
        return navConfig.reduce<NavSection[]>((acc, section) => {
            const visibleChildren = section.children.filter(child => hasRequiredRole(child.requiredRoles));
            if (visibleChildren.length === 0) return acc;
            acc.push({ ...section, children: visibleChildren });
            return acc;
        }, []);
    }, [hasRequiredRole]);

    /* ---------- expanded parent menus ------------------------------- */
    const [expanded, setExpanded] = useState<string[]>(
        visibleSections
            .filter(i => i.children.some(c => c.href === pathname))
            .map(i => i.label),
    );

    useEffect(() => {
        setExpanded(prev => {
            const filteredPrev = prev.filter(label =>
                visibleSections.some(section => section.label === label),
            );
            if (filteredPrev.length === 0) {
                const initialFromPath = visibleSections
                    .filter(section => section.children.some(child => child.href === pathname))
                    .map(section => section.label);
                if (initialFromPath.length > 0) {
                    return initialFromPath;
                }
            }
            return filteredPrev;
        });
    }, [visibleSections, pathname]);
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

        visibleSections.forEach(({ type = 'menu', label, icon: Icon, children }) => {
            const parentOpen = expanded.includes(label);

            if (type === 'title') {
                items.push(
                    <ListItemButton
                        key={label}
                        onClick={() => toggleParent(label)}
                        sx={{
                            mb: 0.5,
                            px: 2,
                            height: ITEM_H,
                            fontSize: 15,
                            fontWeight: 500,
                            borderRadius: 1.5,
                            '& .MuiListItemIcon-root': {
                                minWidth: 32,
                                '& svg': { fontSize: ICON_W },
                            },
                            bgcolor: expanded.includes(label)
                                ? alpha(theme.palette.text.primary, isDark ? 0.08 : 0.04)
                                : 'transparent',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.text.primary, isDark ? 0.12 : 0.06),
                            },
                        }}
                    >
                        {Icon && (
                            <ListItemIcon>
                                <Icon/>
                            </ListItemIcon>
                        )}
                        <ListItemText
                            primary={t(label)}
                            primaryTypographyProps={{ noWrap: true }}
                        />
                        {parentOpen ? <ExpandLess/> : <ExpandMore/>}
                    </ListItemButton>
                );
            }

            if (children) {
                items.push(
                    <Collapse in={open && parentOpen} timeout="auto" unmountOnExit key={`${label}-collapse`}>
                        <List disablePadding>
                            {children.map(({ icon: ChildIcon, label: cLabel, href }) => (
                                <ListItemButton
                                    key={cLabel}
                                    selected={href === pathname}
                                    sx={{
                                        mx: 1,                          // pill side insets
                                        my: 0.25,
                                        pl: 2.5,                        // indent under the group row
                                        pr: 1.25,
                                        height: ITEM_H,
                                        borderRadius: 1.5,
                                        color: isDark ? 'rgb(210,210,210)' : theme.palette.text.primary,
                                        '& .MuiListItemIcon-root': {
                                            minWidth: 32,
                                            '& svg': { fontSize: ICON_W },
                                        },
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.text.primary, isDark ? 0.12 : 0.06),
                                            '& .MuiListItemIcon-root': { color: isDark ? 'rgb(215,215,215)' : theme.palette.text.primary},
                                        },
                                        '&.Mui-selected': {
                                            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.24 : 0.12),
                                            color: isDark ? 'rgb(230,230,230)' : theme.palette.primary.main,
                                            fontWeight: 600,
                                            borderRadius: 1.5,                 // 12px
                                            '& .MuiListItemIcon-root': {
                                                color: theme.palette.primary.main,
                                            },
                                            pl: 2.25,
                                            borderLeft: `3px solid ${theme.palette.primary.main}`,
                                        },
                                    }}
                                    onClick={() => {
                                        if (!isUpLg) setOpen(false);
                                        router.push(href);
                                    }}
                                >
                                    {ChildIcon && (
                                        <ListItemIcon>
                                            <ChildIcon/>
                                        </ListItemIcon>
                                    )}
                                    <ListItemText
                                        primary={t(cLabel)}
                                        primaryTypographyProps={{ noWrap: true }}
                                    />
                                </ListItemButton>

                            ))}
                        </List>
                    </Collapse>
                    ,
                );
            }
        });

        return <List>{items}</List>;
    }, [expanded, isUpLg, pathname, router, setOpen, toggleParent, isDark, visibleSections, open, theme, t]);

    /* ---------- render --------------------------------------------- */
    return (
        <Box sx={{ display: 'flex' }}>

            {/* AppBar */}
            <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={toggle} sx={{ mr: 2 }}>
                        {open ? <MenuOpenIcon/> : <MenuIcon/>}
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }}/>
                    <LanguageToggle />
                    <ThemeModeSwitch/>
                    <Button color="inherit" onClick={() => router.push('/')}>
                        {t('Header.nav.home')}
                    </Button>
                    {/* use logout from UserContext */}
                    <Button color="inherit" onClick={logout}>
                        {t('Header.actions.logout')}
                    </Button>
                </Toolbar>
            </AppBar>

            <Drawer
                variant={permanent ? 'permanent' : 'temporary'}
                open={open}
                onClose={() => setOpen(false)}
                ModalProps={{ keepMounted: true }}
                sx={{
                    width: open ? DRAWER_WIDTH : 0,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    '& .MuiDrawer-paper': {
                        width: open ? DRAWER_WIDTH : 0,
                        overflowX: 'hidden',
                        borderRight: 0,
                        boxShadow: open ? '0 0 1px rgba(0,0,0,.08), 0 8px 24px rgba(0,0,0,.08)' : 'none',
                        pointerEvents: open ? 'auto' : 'none',
                        visibility: open ? 'visible' : 'hidden',
                        // use proper paper in light, slightly deeper tone in dark
                        backgroundColor: isDark ? 'rgb(40,40,40)' : theme.palette.background.paper,
                        // add a subtle divider tint in dark so edges don’t disappear
                        borderColor: alpha(theme.palette.divider, isDark ? 0.3 : 1),
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: open
                                ? theme.transitions.duration.enteringScreen
                                : theme.transitions.duration.leavingScreen,
                        }),
                    },
                }}

            >
                {open && (
                    <>
                        {/* spacer so drawer content starts below fixed AppBar */}
                        <Box sx={{ ...theme.mixins.toolbar }}/>
                        {/*<DrawerHeader>*/}
                        {/*    <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: .2 }}>*/}
                        {/*        Parcel*/}
                        {/*    </Typography>*/}
                        {/*</DrawerHeader>*/}
                        {drawerMenus}
                    </>
                )}
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
                <React.Suspense fallback={<Loading/>}>{children}</React.Suspense>
            </Box>
        </Box>
    );
};

export default ConsoleShell;

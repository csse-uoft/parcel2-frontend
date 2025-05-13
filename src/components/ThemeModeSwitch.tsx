'use client';

import React from 'react';
import { IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { useColorScheme } from "@mui/material/styles";

type Mode = 'system' | 'light' | 'dark';

export default function ThemeModeSwitch() {
    const { mode, setMode } = useColorScheme();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    if (!mode) {
        return null;
    }

    const options: { label: string; value: Mode; icon: React.ReactElement }[] = [
        { label: 'System', value: 'system', icon:  <Brightness4Icon fontSize="small" /> },
        { label: 'Light', value: 'light', icon: <LightModeIcon fontSize="small" /> },
        { label: 'Dark', value: 'dark', icon: <DarkModeIcon fontSize="small" /> },
    ];

    const current = options.find(o => o.value === mode)!;

    return (
        <>
            <Tooltip title="Theme">
                <IconButton
                    color="inherit"
                    size="large"
                    onClick={e => setAnchorEl(e.currentTarget)}
                >
                    {current.icon}
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
                MenuListProps={{ dense: true }}
            >
                {options.map(o => (
                    <MenuItem
                        key={o.value}
                        selected={o.value === mode}
                        onClick={() => {
                            setMode(o.value);
                            setAnchorEl(null);
                        }}
                    >
                        <ListItemIcon>{o.icon}</ListItemIcon>
                        <ListItemText>{o.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

import * as React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import { SitemarkIcon } from './CustomIcons';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';

export const parcelFeatures = [
    {
        icon: <GavelRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Unified RFx hub',
        description:
            'Create and publish RFPs, RFQs, REOIs, and RFIs in one place, then auto‑share across the affiliate network.',
    },
    {
        icon: <CloudUploadRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Secure e‑submissions',
        description:
            'Vendors upload bids directly on‑platform—no email attachments—backed by tamper‑proof audit trails.',
    },
    {
        icon: <ChecklistRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Smart compliance checks',
        description:
            'Real‑time validation flags missing docs or fields so every bid arrives 100 % compliant.',
    },
    {
        icon: <DescriptionRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Contract lifecycle',
        description:
            'Draft, e‑sign, monitor milestones, and get automatic renewal reminders in a single repository.',
    },
    {
        icon: <GroupsRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'Supplier management',
        description:
            'Onboard partners, track performance KPIs, and maintain certifications in a live vendor database.',
    },
    // {
    //     icon: <InsightsRoundedIcon sx={{ color: 'text.secondary' }} />,
    //     title: 'Actionable analytics',
    //     description:
    //         'Interactive dashboards turn spend, risk, and performance data into faster, better decisions.',
    // },
    {
        icon: <LightbulbRoundedIcon sx={{ color: 'text.secondary' }} />,
        title: 'AI‑powered insights',
        description:
            'Get predictive demand forecasts and intelligent supplier recommendations right where you work.',
    }
];

export default function Content() {
    return (
        <Stack
            sx={{ flexDirection: 'column', alignSelf: 'center', gap: 4, maxWidth: 450 }}
        >
            {/*<Box sx={{ display: { xs: 'none', md: 'flex' } }}>*/}
            {/*    <SitemarkIcon />*/}
            {/*</Box>*/}
            {parcelFeatures.map((item, index) => (
                <Stack key={index} direction="row" sx={{ gap: 2 }}>
                    {item.icon}
                    <div>
                        <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                            {item.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {item.description}
                        </Typography>
                    </div>
                </Stack>
            ))}
        </Stack>
    );
}
'use client'

import * as React from 'react';
import Image from 'next/image';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Header from "@/components/header/Header";
import { useUserContext } from "@/contexts/UserContext";
import { Loading } from "@/components/Loading";
import { useTranslations } from 'next-intl';
import NextLink from 'next/link';

// Icons
import HandshakeIcon from '@mui/icons-material/Handshake';
import SchoolIcon from '@mui/icons-material/School';
import PaidIcon from '@mui/icons-material/Paid';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import GroupsIcon from '@mui/icons-material/Groups';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const backgroundSrc = '/background-1.jpg';

function Background() {
    return (
        <Image
            alt="Mountains"
            src={backgroundSrc}
            placeholder="blur"
            quality={100}
            fill
            sizes="100vw"
            style={{
                objectFit: 'cover',
                zIndex: -1,
            }}
        />
    )
}

export default function Home() {
    const { isLoading } = useUserContext();
    const t = useTranslations();
    
    if (isLoading) {
        return <Loading/>;
    }

    const features = [
        { icon: <HandshakeIcon fontSize="large" color="primary" />, text: t('Home.features.matchmaking') },
        { icon: <SchoolIcon fontSize="large" color="primary" />, text: t('Home.features.knowledge') },
        { icon: <PaidIcon fontSize="large" color="primary" />, text: t('Home.features.funding') },
        { icon: <VolunteerActivismIcon fontSize="large" color="primary" />, text: t('Home.features.equity') },
    ];

    return (
        <>
            <Header/>
            <Container maxWidth="lg">
                {/*<Background/>*/}
                {/* Hero Section */}
                <Box
                    sx={{
                        my: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        gap: 3,
                    }}
                >
                    <Typography variant="h3" component="h1" gutterBottom>
                        {t('Home.title')}
                    </Typography>
                    <Typography variant="h6" component="p" color="text.secondary" sx={{ maxWidth: 900 }}>
                        {t('Home.taglineSummary')}
                    </Typography>
                </Box>

                {/* About Section */}
                <Box id="about" sx={{ scrollMarginTop: '100px' }}>
                    <Box sx={{ my: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                <GroupsIcon color="primary" fontSize="large" />
                                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                                    {t('Home.aboutSubtitle1')}
                                </Typography>
                            </Stack>
                            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                                {t('Home.shortDescription')}
                            </Typography>
                        </Box>
                        
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                <LightbulbIcon color="primary" fontSize="large" />
                                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
                                    {t('Home.aboutSubtitle2')}
                                </Typography>
                            </Stack>
                            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                                {t('Home.elevatorPitch')}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Features with Icons */}
                    <Box sx={{ my: 8 }}>
                        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
                            {t('Home.featuresTitle')}
                        </Typography>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="center" alignItems="stretch">
                            {features.map((feature, index) => (
                                <Paper key={index} elevation={2} sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
                                    {feature.icon}
                                    <Typography variant="body1">
                                        {feature.text}
                                    </Typography>
                                </Paper>
                            ))}
                        </Stack>
                    </Box>
                </Box>

                {/* Mission Section */}
                <Box id="mission" sx={{ my: 8, scrollMarginTop: '100px', textAlign: 'center' }}>
                     <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                        {t('Mission.title')}
                    </Typography>
                    <Typography variant="h6" component="p" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
                        {t('Mission.statement')}
                    </Typography>
                </Box>
        
            </Container>
        </>
    );
}

'use client';

import * as React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { alpha, useColorScheme } from '@mui/material/styles';

import Header from '@/components/header/Header';
import { useUserContext } from '@/contexts/UserContext';
import { Loading } from '@/components/Loading';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

// Icons
import HandshakeIcon from '@mui/icons-material/Handshake';
import SchoolIcon from '@mui/icons-material/School';
import PaidIcon from '@mui/icons-material/Paid';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import GroupsIcon from '@mui/icons-material/Groups';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InsightsIcon from '@mui/icons-material/Insights';
import HubIcon from '@mui/icons-material/Hub';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PublicIcon from '@mui/icons-material/Public';

const backgroundSrc = '/background-1.jpg';

function HeroBackground() {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: -2,
        overflow: 'hidden',
        borderBottomLeftRadius: { xs: 24, md: 48 },
        borderBottomRightRadius: { xs: 24, md: 48 },
      }}
      aria-hidden
    >
      <Image
        alt="Canada housing landscape"
        src={backgroundSrc}
        fill
        priority
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />
      {/* Dark overlay for contrast */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(5, 10, 20, 0.55)',
        }}
      />
      {/* Subtle gradient vignette */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1200px 600px at 10% 0%, rgba(25,118,210,0.45), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(0,200,150,0.35), transparent 55%)',
          mixBlendMode: 'screen',
        }}
      />
    </Box>
  );
}
export default function Home() {
  const { isLoading } = useUserContext();
  const t = useTranslations();
  const router = useRouter();

  const {mode, systemMode} = useColorScheme();
  const resolvedMode = (mode === 'system' ? systemMode : mode) ?? 'light';
  const isDarkMode = resolvedMode === 'dark';

  if (isLoading) return <Loading />;

  const features = [
    {
      icon: <HandshakeIcon fontSize="large" color="primary" />,
      title: t('Home.features.matchmaking.title'),
      text: t('Home.features.matchmaking.text'),
      link: '/register',
    },
    {
      icon: <SchoolIcon fontSize="large" color="primary" />,
      title: t('Home.features.knowledge.title'),
      text: t('Home.features.knowledge.text'),
      link: '/knowledge-hub',
    },
    {
      icon: <PaidIcon fontSize="large" color="primary" />,
      title: t('Home.features.funding.title'),
      text: t('Home.features.funding.text'),
    },
    {
      icon: <VolunteerActivismIcon fontSize="large" color="primary" />,
      title: t('Home.features.equity.title'),
      text: t('Home.features.equity.text'),
    },
  ];

  const steps = [
    {
      icon: <HubIcon color="primary" />,
      title: t('Home.howItWorks.steps.connect.title'),
      body: t('Home.howItWorks.steps.connect.body'),
    },
    {
      icon: <InsightsIcon color="primary" />,
      title: t('Home.howItWorks.steps.coDesign.title'),
      body: t('Home.howItWorks.steps.coDesign.body'),
    },
    {
      icon: <VerifiedIcon color="primary" />,
      title: t('Home.howItWorks.steps.deliver.title'),
      body: t('Home.howItWorks.steps.deliver.body'),
    },
  ];

  return (
    <>
      <Header />

      {/* HERO */}
      <Box component="section" sx={{ position: 'relative', pt: { xs: 10, md: 14 }, pb: { xs: 8, md: 10 }, color: 'common.white' }}>
        <HeroBackground />

        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    icon={<PublicIcon />}
                    label={t('Home.hero.chips.collaboration')}
                    sx={{
                      bgcolor: alpha('#fff', 0.12),
                      color: 'common.white',
                      '& .MuiChip-icon': { color: 'common.white' },
                    }}
                  />
                  <Chip label={t('Home.hero.chips.ai')} sx={{ bgcolor: alpha('#fff', 0.12), color: 'common.white' }} />
                  <Chip label={t('Home.hero.chips.sustainable')} sx={{ bgcolor: alpha('#fff', 0.12), color: 'common.white' }} />
                </Stack>

                <Typography variant="h2" component="h1" sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: -0.5, textWrap: 'balance' }}>
                  {t('Home.title')}
                </Typography>

                <Typography variant="h6" component="p" sx={{ maxWidth: 820, opacity: 0.95, lineHeight: 1.7 }}>
                  {t('Home.taglineSummary')}
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    component={Link}
                    href="#about"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ py: 1.25, px: 3, fontWeight: 700, borderRadius: 999, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}
                  >
                    {t('Home.hero.cta.explore')}
                  </Button>
                  <Button
                    component={Link}
                    href="#mission"
                    variant="outlined"
                    size="large"
                    sx={{
                      py: 1.25,
                      px: 3,
                      fontWeight: 700,
                      borderRadius: 999,
                      color: 'common.white',
                      borderColor: alpha('#fff', 0.8),
                      '&:hover': { borderColor: 'common.white' },
                    }}
                  >
                    {t('Home.hero.cta.mission')}
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: alpha('#0b1220', 0.6),
                  border: `1px solid ${alpha('#fff', 0.12)}`,
                  borderRadius: 4,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Stack spacing={2}>
                  <Typography variant="overline" sx={{ opacity: 0.9, color: 'common.white' }}>
                    {t('Home.hero.whatYouCanDo')}
                  </Typography>

                  {features.map((feature, index) => (
                    <Stack
                      key={index}
                      onClick={feature.link ? () => router.push(feature.link) : undefined}
                      direction="row"
                      spacing={2}
                      alignItems="flex-start"
                      sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#fff', isDarkMode ? 0.04 :0.14), color: 'common.white', cursor: feature.link ? 'pointer' : 'default' }}
                    >
                      <Box sx={{ mt: 0.25 }}>{feature.icon}</Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {feature.text}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* ABOUT */}
        <Box id="about" component="section" sx={{ my: { xs: 7, md: 9 }, scrollMarginTop: '100px' }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                variant='outlined'
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  height: '100%',
                  borderRadius: 4,
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  background: 'linear-gradient(180deg, rgba(25,118,210,0.06), transparent 40%)',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  <GroupsIcon color="primary" />
                  <Typography variant="h4" component="h2" fontWeight={800}>
                    {t('Home.aboutSubtitle1')}
                  </Typography>
                </Stack>

                <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                  {t('Home.shortDescription')}
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                variant='outlined'
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  height: '100%',
                  borderRadius: 4,
                  border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  background: 'linear-gradient(180deg, rgba(0,200,150,0.06), transparent 40%)',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                  <LightbulbIcon color="primary" />
                  <Typography variant="h4" component="h2" fontWeight={800}>
                    {t('Home.aboutSubtitle2')}
                  </Typography>
                </Stack>

                <Typography variant="body1" sx={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                  {t('Home.elevatorPitch')}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* HOW IT WORKS */}
        <Box component="section" sx={{ my: { xs: 7, md: 9 } }}>
          <Stack spacing={1} sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="overline" color="text.secondary">
              {t('Home.howItWorks.overline')}
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {t('Home.howItWorks.title')}
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {steps.map((step, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Paper elevation={2} sx={{ p: 3, height: '100%', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -24,
                      right: -24,
                      width: 120,
                      height: 120,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                      borderRadius: '50%',
                    }}
                    aria-hidden
                  />
                  <Stack spacing={1.25}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {step.icon}
                      <Typography variant="h6" fontWeight={800}>
                        {step.title}
                      </Typography>
                    </Stack>
                    <Typography color="text.secondary" lineHeight={1.7}>
                      {step.body}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FEATURES */}
        <Box component="section" sx={{ my: { xs: 7, md: 9 } }}>
          <Stack spacing={1} sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="overline" color="text.secondary">
              {t('Home.featuresTitle')}
            </Typography>
            <Typography variant="h4" fontWeight={800}>
              {t('Home.featuresSection.title')}
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                <Paper
                  elevation={1}
                  onClick={feature.link ? () => router.push(feature.link) : undefined}
                  sx={{
                    p: 3,
                    height: '100%',
                    borderRadius: 4,
                    textAlign: 'left',
                    transition: 'transform 160ms ease, box-shadow 160ms ease',
                    cursor: feature.link ? 'pointer' : 'default',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                  }}
                >
                  <Stack spacing={1.5}>
                    <Box>{feature.icon}</Box>
                    <Typography variant="h6" fontWeight={800}>
                      {feature.title}
                    </Typography>
                    <Divider />
                    <Typography color="text.secondary" lineHeight={1.7}>
                      {feature.text}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* MISSION */}
        <Box id="mission" component="section" sx={{ my: { xs: 7, md: 9 }, scrollMarginTop: '100px' }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 5,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="h4" component="h2" fontWeight={900} gutterBottom>
                  {t('Mission.title')}
                </Typography>
                <Typography variant="h6" component="p" sx={{ lineHeight: 1.8 }}>
                  {t('Mission.statement')}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.5}>
                  <Button component={Link} href="/register" variant="contained" size="large" fullWidth sx={{ borderRadius: 3, fontWeight: 800 }}>
                    {t('Home.missionSection.cta.start')}
                  </Button>
                  {/* <Button component={Link} href="/about" variant="outlined" size="large" fullWidth sx={{ borderRadius: 3, fontWeight: 800 }}>
                    {t('Home.missionSection.cta.learnMore')}
                  </Button> */}
                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    {t('Home.missionSection.poweredBy')}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* FINAL CTA */}
        <Box component="section" sx={{ my: { xs: 8, md: 10 }, textAlign: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h4" fontWeight={900}>
              {t('Home.finalCta.title')}
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 820 }}>
              {t('Home.finalCta.body')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button component={Link} href="/register" variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 999, px: 4, fontWeight: 800 }}>
                {t('Home.finalCta.join')}
              </Button>
              <Button component={Link} href="/contact" variant="text" size="large" sx={{ px: 2.5, fontWeight: 800 }}>
                {t('Home.finalCta.talk')}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
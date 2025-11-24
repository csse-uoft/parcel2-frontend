import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import NextLink from 'next/link';
import Header from '@/components/header/Header';
import { getTranslations } from 'next-intl/server';

export default async function About() {
  const [tAbout, tMission] = await Promise.all([
    getTranslations('About'),
    getTranslations('Mission'),
  ]);

  return (
    <>
      <Header />
      <Container maxWidth="lg">
        <Box
          sx={{
            my: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            alignItems: { xs: 'flex-start', md: 'center' },
            textAlign: { xs: 'left', md: 'center' },
          }}
        >
          <Typography variant="h3" component="h1">
            {tAbout('title')}
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 900 }}>
            {tAbout('body')}
          </Typography>
          <Box sx={{ width: '100%', maxWidth: 900, textAlign: 'left' }}>
            <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
              {tAbout('missionHeading')}
            </Typography>
            <Typography variant="body1">
              {tMission('statement')}
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
  );
}

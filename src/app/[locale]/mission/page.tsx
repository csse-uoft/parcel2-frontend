import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import NextLink from 'next/link';
import Header from '@/components/header/Header';
import { getTranslations } from 'next-intl/server';

export default async function MissionPage() {
  const t = await getTranslations('Mission');

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
            {t('title')}
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 900 }}>
            {t('statement')}
          </Typography>
          <Button
            component={NextLink}
            href="/"
            variant="contained"
            sx={{ alignSelf: { xs: 'stretch', md: 'center' }, maxWidth: 300 }}
          >
            {t('ctaHome')}
          </Button>
        </Box>
      </Container>
    </>
  );
}

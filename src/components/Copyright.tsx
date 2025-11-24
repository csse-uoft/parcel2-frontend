'use client';

import * as React from 'react';
import Typography from '@mui/material/Typography';
import MuiLink from '@mui/material/Link';
import Box from '@mui/material/Box';
import Image from 'next/image';
import {useColorScheme} from '@mui/material/styles';
import {useLocale, useTranslations} from 'next-intl';

export default function Footer() {
  const {mode, systemMode} = useColorScheme();
  const resolvedMode = (mode === 'system' ? systemMode : mode) ?? 'light';
  const locale = useLocale();
  const t = useTranslations('Footer');

  const isFrench = locale === 'fr';
  const isDarkMode = resolvedMode === 'dark';

  const fundingImageSrc = React.useMemo(() => {
    if (isFrench) {
      return isDarkMode
        ? '/fundedInPartByGoC_fr_en_white.png'
        : '/fundedInPartByGoC_fr_en_black.png';
    }
    return isDarkMode
      ? '/fundedInPartByGoC_en_fr_white.png'
      : '/fundedInPartByGoC_en_fr_black.png';
  }, [isDarkMode, isFrench]);

  return (
    <Box
      component="footer"
      sx={{
        mt: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: {xs: 320, sm: 620},
          maxWidth: '100%',
          aspectRatio: '649 / 73',
        }}
      >
        <Image
          src={fundingImageSrc}
          alt={t('fundingAlt')}
          fill
          // sizes="(max-width: 600px) 85vw, 320px"
          style={{objectFit: 'contain'}}
          priority={false}
        />
      </Box>

      <Typography variant="body2" align="center" sx={{color: 'text.secondary'}}>
        {'Copyright © '}
        <MuiLink color="inherit" href="https://connectbuildnow.org/">
          Parcel2
        </MuiLink>{' '}
        {new Date().getFullYear()}.
      </Typography>
    </Box>
  );
}

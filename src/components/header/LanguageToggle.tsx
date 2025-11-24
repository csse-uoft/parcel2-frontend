'use client';

import * as React from 'react';
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import {useLocale, useTranslations} from 'next-intl';
import {useRouter, usePathname} from '@/i18n/navigation';
import {locales} from '@/i18n/routing';

type AppLocale = (typeof locales)[number];

export default function LanguageToggle() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Header.language');
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isPending, startTransition] = React.useTransition();

  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const handleSelect = (newLocale: AppLocale) => {
    if (newLocale === locale) {
      closeMenu();
      return;
    }

    startTransition(() => {
      router.replace(pathname ?? '/', {locale: newLocale});
      closeMenu();
    });
  };

  return (
    <>
      <Tooltip title={t('ariaLabel')}>
        <span>
          <IconButton
            color="inherit"
            size="large"
            aria-label={t('ariaLabel')}
            onClick={openMenu}
            disabled={isPending}
          >
            <TranslateIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        MenuListProps={{ dense: true }}
      >
        {locales.map((value) => (
          <MenuItem
            key={value}
            selected={value === locale}
            onClick={() => handleSelect(value)}
          >
            <ListItemIcon>
              <TranslateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t(`options.${value}`)} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

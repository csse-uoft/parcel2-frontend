export const locales = ['en', 'fr'] as const;
export const defaultLocale = 'en' as const;

export const routing = {
  locales,
  defaultLocale,
  localePrefix: 'always' as const,
};


import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale} from './routing';
import {hasLocale} from 'next-intl';

type Locale = (typeof locales)[number];

const requestConfig = getRequestConfig(async ({requestLocale}) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;

  const resolvedLocale = hasLocale(locales, requested)
    ? requested
    : defaultLocale;

  try {
    const messages = (await import(`../messages/${resolvedLocale}.json`)).default;
    return {locale: resolvedLocale, messages};
  } catch (error) {
    console.error(`Missing translation file for locale "${resolvedLocale}"`, error);
    const fallback = (await import('../messages/en.json')).default;
    return {locale: defaultLocale, messages: fallback};
  }
});

export default requestConfig;

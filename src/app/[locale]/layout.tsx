import type { ReactNode } from 'react';
import ClientProviders from '../ClientProviders';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/routing';
import { NextIntlClientProvider } from 'next-intl';

export const dynamic = 'force-dynamic';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale: (typeof locales)[number]) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const locale = (await params).locale;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <ClientProviders>
        {children}
      </ClientProviders>
    </NextIntlClientProvider>
  );
}

import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'Console.Dashboard' });
    return {
        title: t('title')
    };
}

export default function DashboardHome() {
    const t = useTranslations('Console.Dashboard');
    return <h2>{t('welcome')}</h2>;
}

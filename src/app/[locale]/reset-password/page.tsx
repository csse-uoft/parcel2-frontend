import ResetPasswordForm from './ResetPasswordForm';

interface ResetPasswordPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const params = searchParams ? await searchParams : undefined;
    const tokenParam = params?.token;
    const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam ?? '';

    return <ResetPasswordForm token={token} />;
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header/Header';
import { useCompletePasswordReset } from '@/lib/hooks/useAuth';
import { FetcherError } from '@/lib/errors';
import {
    Alert,
    Box,
    Button,
    Card,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

interface ResetPasswordPageProps {
    searchParams?: { [key: string]: string | string[] | undefined };
}

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
    const router = useRouter();
    const tokenParam = searchParams?.token;
    const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam ?? '';

    const { trigger: completeReset, isMutating } = useCompletePasswordReset();

    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (successMessage) {
            router.push('/login');
            return;
        }

        if (!token) {
            setErrorMessage('This reset link is missing or has already been used. Request a new reset email from the login page.');
            return;
        }

        if (!STRONG_PASSWORD_REGEX.test(password)) {
            setErrorMessage('Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        setErrorMessage(null);

        try {
            await completeReset({ token, password });
            setSuccessMessage('Your password has been reset. You can now sign in with the new password.');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            const message = err instanceof FetcherError ? err.message : 'Unable to reset password. Please try again later.';
            setErrorMessage(message);
        }
    };

    const disableInputs = Boolean(successMessage) || isMutating || !token;

    return (
        <>
            <Header />
            <Stack
                component="main"
                sx={{
                    minHeight: '100vh',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: { xs: 6, md: 10 },
                    px: 2,
                }}
            >
                <Card
                    elevation={3}
                    sx={{
                        width: '100%',
                        maxWidth: 480,
                        p: { xs: 3, md: 4 },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                    }}
                >
                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <div>
                                <Typography component="h1" variant="h4" gutterBottom>
                                    Choose a new password
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Enter a strong password below. Once you submit, you can sign in immediately with your new credentials.
                                </Typography>
                            </div>

                            {!token && (
                                <Alert severity="warning">
                                    This reset link is missing or has already been used. Request a new reset email from the login page.
                                </Alert>
                            )}

                            {errorMessage && (
                                <Alert severity="error">{errorMessage}</Alert>
                            )}

                            {successMessage && (
                                <Alert severity="success">{successMessage}</Alert>
                            )}

                            <TextField
                                id="new-password"
                                name="password"
                                type="password"
                                label="New password"
                                placeholder="Enter a strong password"
                                value={password}
                                onChange={event => {
                                    setPassword(event.target.value);
                                    if (errorMessage) {
                                        setErrorMessage(null);
                                    }
                                }}
                                disabled={disableInputs}
                                autoComplete="new-password"
                                required
                                fullWidth
                            />

                            <TextField
                                id="confirm-password"
                                name="confirmPassword"
                                type="password"
                                label="Confirm password"
                                placeholder="Re-enter the new password"
                                value={confirmPassword}
                                onChange={event => {
                                    setConfirmPassword(event.target.value);
                                    if (errorMessage) {
                                        setErrorMessage(null);
                                    }
                                }}
                                disabled={disableInputs}
                                autoComplete="new-password"
                                required
                                fullWidth
                            />

                            <Stack spacing={1.5}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={isMutating || (!token && !successMessage)}
                                >
                                    {successMessage ? 'Return to login' : isMutating ? 'Saving…' : 'Reset password'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="text"
                                    onClick={() => router.push('/login')}
                                    disabled={isMutating}
                                >
                                    Back to login
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Card>
            </Stack>
        </>
    );
}

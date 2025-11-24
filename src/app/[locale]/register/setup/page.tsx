'use client';

import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    CircularProgress,
    Button,
    Stack,
} from '@mui/material';
import { useRouter } from '@/i18n/navigation';

import Header from '@/components/header/Header';
import { useUser, useUserProfile } from '@/lib/hooks/useUser';
import SetupProfileForm, {
    SetupProfileFormData,
} from '@/components/forms/SetupForm';
import OrganizationForm from "@/components/forms/OrganizationForm";
import { useUserContext } from '@/contexts/UserContext';

export default function InitialSetupPage() {
    const router = useRouter();
    const { profile, isLoading, isError, mutate } = useUserProfile();
    const { mutate: mutateUser } = useUser();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const { enqueueMessage } = useUserContext();

    useEffect(() => {
        if (isLoading || isError || isRedirecting) {
            return;
        }

    const profileFullName = profile?.person?.fullName;
    const hasCompletedProfile = Boolean(profile?.isRegistrationComplete) || Boolean(typeof profileFullName === 'string' && profileFullName.trim().length > 0);
        if (hasCompletedProfile) {
            setIsRedirecting(true);
            router.replace('/console/opportunity/search');
        }
    }, [isLoading, isError, profile, router, isRedirecting]);

    /* ------------------------------------------------------------ */
    /*  Loading & error states                                      */
    /* ------------------------------------------------------------ */
    if (isRedirecting) {
        return (
            <Container sx={{ py: 4 }}>
                <CircularProgress/>
            </Container>
        );
    }

    if (isLoading) {
        return (
            <Container sx={{ py: 4 }}>
                <CircularProgress/>
            </Container>
        );
    }

    if (isError) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography color="error">Failed to load profile.</Typography>
            </Container>
        );
    }


    /* ------------------------------------------------------------ */
    /*  Submit handler – called by SetupProfileForm                 */
    /* ------------------------------------------------------------ */
    const handleSave = async (data: SetupProfileFormData) => {
        setIsRedirecting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/profile/init`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    person: data,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save profile');
            }

            await Promise.all([mutate(), mutateUser()]);
            router.replace('/console/opportunity/search');
        } catch (error) {
            console.error('Failed to initialize profile', error);
            enqueueMessage('Unable to save profile. Please try again.', 'error');
            setIsRedirecting(false);
        }
    };


    return (
        <>
            <Header/>

            <Container maxWidth="md" sx={{ py: 4 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="start"
                    sx={{ mb: 2 }}
                >
                    <Typography variant="h4" gutterBottom>
                        Finish Your Profile
                    </Typography>
                </Stack>

                <Paper elevation={3} sx={{ p: 3 }}>
                    <SetupProfileForm
                        defaultValues={profile.person}
                        onSubmit={handleSave}
                    />

                    {/*<OrganizationForm onSubmit={data => console.log(data)}/>*/}
                </Paper>

                {/* Submit button now sits inside the form,
            so no extra button needed here. */}
            </Container>
        </>
    );
}

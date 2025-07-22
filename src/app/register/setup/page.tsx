'use client';

import React from 'react';
import {
    Container,
    Typography,
    Paper,
    CircularProgress,
    Button,
    Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';

import Header from '@/components/header/Header';
import { useUserProfile } from '@/lib/hooks/useUser';
import SetupProfileForm, {
    SetupProfileFormData,
} from '@/components/forms/SetupForm';
import OrganizationForm from "@/components/forms/OrganizationForm";

export default function InitialSetupPage() {
    const router = useRouter();
    const { profile, isLoading, isError, mutate } = useUserProfile();

    /* ------------------------------------------------------------ */
    /*  Loading & error states                                      */
    /* ------------------------------------------------------------ */
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
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/profile/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                person: data,
            }),
        });

        await mutate();                // refresh SWR cache
        router.push('/console/opportunity/search');
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

                    <OrganizationForm onSubmit={data => console.log(data)}/>
                </Paper>

                {/* Submit button now sits inside the form,
            so no extra button needed here. */}
            </Container>
        </>
    );
}

'use client';

import React, { useMemo, useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    CircularProgress,
    Button,
    Stack,
} from '@mui/material';
import { useUserProfile } from '@/lib/hooks/useUser';
import SetupProfileForm, {
    SetupProfileFormData,
} from '@/components/forms/SetupForm';

export default function ProfilePage() {
    const { profile, isLoading, isError, mutate } = useUserProfile();

    /* --- UI state ------------------------------------------------- */
    const [saving, setSaving] = useState(false);

    /* --- Convert remote data → form defaults ---------------------- */
    const defaultValues: SetupProfileFormData | undefined = useMemo(() => {
        if (!profile) return undefined;

        return {
            fullName: profile.person?.fullName ?? '',
            firstName: profile.person?.firstName ?? '',
            middleName: profile.person?.middleName ?? '',
            lastName: profile.person?.lastName ?? '',
            primaryAddress: {
                streetNumber: profile.person?.primaryAddress?.streetNumber ?? '',
                streetName: profile.person?.primaryAddress?.streetName ?? '',
                streetType: profile.person?.primaryAddress?.streetType ?? '',
                localityName: profile.person?.primaryAddress?.localityName ?? '',
                provinceName: profile.person?.primaryAddress?.provinceName ?? '',
                postalCode: profile.person?.primaryAddress?.postalCode ?? '',
                countryName: profile.person?.primaryAddress?.countryName ?? '',
            },
        };
    }, [profile]);

    /* --- Submit handler ------------------------------------------- */
    const handleSave = async (data: SetupProfileFormData) => {
        try {
            setSaving(true);

            await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    person: {
                        fullName: data.fullName,
                        firstName: data.firstName,
                        middleName: data.middleName,
                        lastName: data.lastName,
                        primaryAddress: data.primaryAddress,
                    },
                }),
            });

            await mutate();          // refresh SWR cache
        } finally {
            setSaving(false);
        }
    };

    /* --- Loading / error states ----------------------------------- */
    if (isLoading || !defaultValues) {
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

    /* --- Main UI --------------------------------------------------- */
    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography variant="h4" gutterBottom>
                    Profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Update your personal details and primary address.
                </Typography>
            </Stack>

            <Paper elevation={3} sx={{ p: 3 }}>
                <SetupProfileForm
                    id="profile-form"          /* connect Save button */
                    defaultValues={defaultValues}
                    onSubmit={handleSave}
                    disabled={saving}
                    showSubmitButton={false}
                />
                <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        type="submit"
                        form="profile-form"
                        disabled={saving}
                    >
                        {saving ? 'Saving…' : 'Save'}
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}

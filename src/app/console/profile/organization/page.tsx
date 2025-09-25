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
import useSWR from 'swr';
import OrganizationForm, {
    OrganizationFormData, organizationInitialValues,   // <- export the type from your form file
} from '@/components/forms/OrganizationForm';


const fetcher = (url: string) =>
    fetch(url, { credentials: 'include' }).then((r) => r.json());

export default function MyOrganizationPage() {

    const { data, error, isLoading, mutate } = useSWR(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/org`,
        fetcher
    );

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);


    const defaultValues: OrganizationFormData | undefined = useMemo(() => {
        if (!data) return undefined;

        // adjust shape if the API fields differ
        return {
            ...organizationInitialValues,
            ...data,
            primaryAddress: data.primaryAddress ?? organizationInitialValues.primaryAddress,
            mailingAddress: data.mailingAddress ?? {},
            deliveryAddress: data.deliveryAddress ?? {},
            // legalNames: (data.legalNames || []).map((name: string) => ({ value: name })),
            acronyms: (data.acronyms || []).map((a: string) => ({ value: a })),
            roleTypes: (data.roleTypes || []).map((r: { iri: string; }) => r.iri),
        };
    }, [data]);


    const handleSave = async (formData: OrganizationFormData) => {
        try {
            setSaving(true);
            await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/org`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        organization: {
                            ...formData,
                            // legalNames: formData.legalNames.map((name) => name.value),
                            acronyms: formData.acronyms?.map((a) => a.value),
                        }
                    }),
                }
            );

            await mutate();            // refresh SWR cache
            setIsEditing(false);
        } finally {
            setSaving(false);
        }
    };


    if (isLoading || !defaultValues) {
        return (
            <Container sx={{ py: 4 }}>
                <CircularProgress/>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography color="error">
                    Failed to load organization profile.
                </Typography>
            </Container>
        );
    }


    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="start"
                sx={{ mb: 2 }}
            >
                <Typography variant="h4" gutterBottom>
                    My Organization
                </Typography>

                {!isEditing ? (
                    <Button variant="outlined" onClick={() => setIsEditing(true)}>
                        Edit
                    </Button>
                ) : (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={() => setIsEditing(false)}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                            form="organization-form"
                            disabled={saving}
                        >
                            {saving ? 'Saving…' : 'Save'}
                        </Button>
                    </Stack>
                )}
            </Stack>

            <Paper elevation={3} sx={{ p: 3 }}>
                <OrganizationForm
                    id="organization-form"
                    defaultValues={defaultValues}
                    onSubmit={handleSave}
                    disabled={!isEditing}
                />
            </Paper>
        </Container>
    );
}

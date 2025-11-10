'use client';

import { useCallback, useMemo, useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    CircularProgress,
    Button,
    Stack,
} from '@mui/material';

import { useUserContext } from '@/contexts/UserContext';
import { FetcherError } from '@/lib/errors';
import { useOrganization, useUpsertOrganization } from '@/lib/hooks/useOrganization';
import OrganizationForm, { OrganizationFormData } from '@/components/forms/OrganizationForm';
import {
    mapOrganizationToFormData,
    buildOrganizationUpdatePayload,
} from '@/components/forms/organizationFormAdapter';

export default function MyOrganizationPage() {
    const { enqueueMessage } = useUserContext();

    const { data, error, isLoading, mutate } = useOrganization();
    const { trigger: upsertOrganization, isMutating } = useUpsertOrganization();

    const [resetToken, setResetToken] = useState(0);

    const hasOrganization = Boolean(data);

    const defaultValues: OrganizationFormData = useMemo(
        () => mapOrganizationToFormData(data ?? undefined),
        [data]
    );

    const handleSave = useCallback(async (formData: OrganizationFormData) => {
        try {
            const payload = buildOrganizationUpdatePayload(formData);
            await upsertOrganization({ organization: payload });

            await mutate();
            setResetToken(token => token + 1);
            enqueueMessage(
                hasOrganization ? 'Organization updated successfully' : 'Organization created successfully',
                'success'
            );
        } catch (err: unknown) {
            if (err instanceof FetcherError) {
                enqueueMessage(err.message, 'error');
            } else {
                enqueueMessage('Unable to update organization', 'error');
            }
        }
    }, [enqueueMessage, hasOrganization, mutate, upsertOrganization]);

    if (isLoading && !data) {
        return (
            <Container sx={{ py: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error && !data) {
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
            <Stack spacing={0.5} sx={{ mb: 2 }}>
                <Typography variant="h4" gutterBottom>
                    {hasOrganization ? 'My Organization' : 'Create Organization'}
                </Typography>
                {!hasOrganization && (
                    <Typography variant="body2" color="text.secondary">
                        Complete the details below to create your organization profile.
                    </Typography>
                )}
            </Stack>

            <Paper elevation={3} sx={{ p: 3 }}>
                <OrganizationForm
                    formId="my-organization-form"
                    defaultValues={defaultValues}
                    disabled={isMutating}
                    resetKey={resetToken}
                    onSubmit={handleSave}
                >
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={isMutating}
                        >
                            {isMutating ? 'Saving…' : hasOrganization ? 'Save' : 'Create'}
                        </Button>
                    </Stack>
                </OrganizationForm>
            </Paper>
        </Container>
    );
}
